import { prisma } from '@/lib/db/prisma'
import dns from 'dns'
import crypto from 'crypto'
import { promisify } from 'util'

const resolveA = promisify(dns.resolve4)
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

export interface DNSRecordInstruction {
  host: string
  value: string
}

export interface DNSVerificationInstructions {
  a: DNSRecordInstruction[]
  cname: DNSRecordInstruction[]
  txt: DNSRecordInstruction[]
}

export interface DNSVerificationResult {
  verified: boolean
  records: {
    a: string[]
    cname: string[]
    txt: string[]
    mx: string[]
    verified: boolean
  }
  errors?: string[]
}

const PLATFORM_A_RECORDS = ['76.76.21.21', '76.76.21.22']

function getParentDomain(domain: string): string {
  const labels = domain.split('.')
  if (labels.length <= 2) return domain
  return labels.slice(1).join('.')
}

export async function verifyDomain(domain: string, userId: string): Promise<DNSVerificationResult> {
  const normalizedDomain = normalizeDomain(domain)
  const parentDomain = getParentDomain(normalizedDomain)
  const errors: string[] = []
  let aRecords: string[] = []
  let cnameRecords: string[] = []
  let txtRecords: string[][] = []
  let mxRecords: string[] = []
  let aVerified = false
  let cnameVerified = false
  let txtVerified = false

  try {
    const verificationToken = generateVerificationToken(userId, normalizedDomain)

    try {
      aRecords = await resolveA(normalizedDomain)
      aVerified = aRecords.some(record => PLATFORM_A_RECORDS.includes(record))
      if (!aVerified && aRecords.length > 0) {
        errors.push(`A record does not point to our platform: ${aRecords.join(', ')}`)
      }
    } catch {
      errors.push('No A record found')
    }

    try {
      const cnameLookup = normalizedDomain.startsWith('www.') ? normalizedDomain : `www.${normalizedDomain}`
      cnameRecords = await resolveCname(cnameLookup)
      cnameVerified = cnameRecords.some(record =>
        /vercel-custom-domain|cname\.vercel-dns\.com|vercel-dns\.com/i.test(record)
      )
      if (!cnameVerified && cnameRecords.length > 0) {
        errors.push(`CNAME does not point to our platform: ${cnameRecords.join(', ')}`)
      }
    } catch {
      // Optional www CNAME is not required for apex-domain ownership verification.
    }

    try {
      const txtTargets = [normalizedDomain]
      if (parentDomain && parentDomain !== normalizedDomain) {
        txtTargets.push(parentDomain)
      }

      const uniqueTxtTargets = [...new Set(txtTargets)]
      for (const txtTarget of uniqueTxtTargets) {
        try {
          const resolved = await resolveTxt(txtTarget)
          const txtValues = resolved.map(record => record.join('')).filter(Boolean)
          txtVerified = txtVerified || txtValues.some(value => value.includes(verificationToken))
          if (txtValues.length > 0) {
            txtRecords.push(...resolved)
          }
        } catch {
          // Keep checking the parent zone if the lookup is unavailable on one target.
        }
      }

      if (!txtVerified && txtRecords.length > 0) {
        errors.push('TXT record does not contain the verification token')
      }
      if (!txtVerified) {
        errors.push('No TXT record found')
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

    const verified = (aVerified || cnameVerified) && txtVerified

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
        a: aRecords,
        cname: cnameRecords,
        txt: txtRecords.flat(),
        mx: mxRecords,
        verified: (aVerified || cnameVerified) && txtVerified,
      },
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    console.error('DNS verification error:', error)
    return {
      verified: false,
      records: {
        a: [],
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

export function getVerificationInstructions(domain: string, userId: string): DNSVerificationInstructions {
  const normalizedDomain = normalizeDomain(domain)
  const token = generateVerificationToken(userId, normalizedDomain)
  const labels = normalizedDomain.split('.')
  const isSubdomain = labels.length > 2
  const subdomainHost = isSubdomain ? labels[0] : 'www'

  return {
    a: isSubdomain ? [] : [
      { host: '@', value: '76.76.21.21' },
      { host: '@', value: '76.76.21.22' },
    ],
    cname: [
      {
        host: subdomainHost,
        value: 'cname.vercel-dns.com',
      },
    ],
    txt: [
      {
        host: '@',
        value: token,
      },
    ],
  }
}