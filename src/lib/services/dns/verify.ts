import { prisma } from '@/lib/db/prisma'
import dns from 'dns'
import crypto from 'crypto'
import { promisify } from 'util'

const resolveCname = promisify(dns.resolveCname)
const resolveTxt = promisify(dns.resolveTxt)
const resolveMx = promisify(dns.resolveMx)

export function normalizeDomain(domain: string): string {
  const trimmed = domain.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').replace(/\.$/, '')

  if (!trimmed) return ''

  try {
    return new URL(`https://${trimmed}`).hostname.replace(/\.$/, '')
  } catch {
    return trimmed
  }
}

export interface DNSVerificationResult {
  verified: boolean
  records: {
    cname: string[]
    txt: string[]
    mx: string[]
    verified: boolean
  }
  errors?: string[]
}

export async function verifyDomain(domain: string, userId: string): Promise<DNSVerificationResult> {
  const normalizedDomain = normalizeDomain(domain)
  const errors: string[] = []
  let cnameRecords: string[] = []
  let txtRecords: string[][] = []
  let mxRecords: string[] = []
  let cnameVerified = false
  let txtVerified = false

  try {
    const verificationToken = generateVerificationToken(userId, normalizedDomain)

    try {
      cnameRecords = await resolveCname(normalizedDomain)
      cnameVerified = cnameRecords.some(record =>
        /vercel-custom-domain|cname\.vercel-dns\.com|vercel-dns\.com/i.test(record)
      )
      if (!cnameVerified && cnameRecords.length > 0) {
        errors.push(`CNAME does not point to our platform: ${cnameRecords.join(', ')}`)
      }
    } catch {
      errors.push('No CNAME record found')
    }

    try {
      txtRecords = await resolveTxt(normalizedDomain)
      const txtValues = txtRecords.map(record => record.join('')).filter(Boolean)
      txtVerified = txtValues.some(value => value.includes(verificationToken))
      if (!txtVerified && txtRecords.length > 0) {
        errors.push('TXT record does not contain the verification token')
      }
    } catch {
      errors.push('No TXT record found')
    }

    try {
      const mx = await resolveMx(normalizedDomain)
      mxRecords = mx.map(r => r.exchange)
    } catch {
      // MX records are optional
    }

    const verified = cnameVerified && txtVerified

    if (verified) {
      await prisma.customDomain.update({
        where: { domain: normalizedDomain },
        data: {
          verified: true,
          verifiedAt: new Date(),
        },
      })
    }

    return {
      verified,
      records: {
        cname: cnameRecords,
        txt: txtRecords.flat(),
        mx: mxRecords,
        verified: cnameVerified && txtVerified,
      },
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    console.error('DNS verification error:', error)
    return {
      verified: false,
      records: {
        cname: [],
        txt: [],
        mx: [],
        verified: false,
      },
      errors: ['DNS verification failed'],
    }
  }
}

function generateVerificationToken(userId: string, domain: string): string {
  const hash = crypto.createHash('sha256')
  hash.update(`${userId}:${domain}:${process.env.JWT_SECRET || 'nextgen-local-secret'}`)
  return `nextgen-verify-${hash.digest('hex').substring(0, 16)}`
}

export function getVerificationInstructions(domain: string, userId: string): {
  cname: { host: string; value: string }
  txt: { host: string; value: string }
} {
  const normalizedDomain = normalizeDomain(domain)
  const token = generateVerificationToken(userId, normalizedDomain)
  return {
    cname: {
      host: normalizedDomain,
      value: 'cname.vercel-dns.com',
    },
    txt: {
      host: normalizedDomain,
      value: token,
    },
  }
}