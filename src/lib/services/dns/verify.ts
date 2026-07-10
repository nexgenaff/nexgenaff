import { prisma } from '@/lib/db/prisma'
import dns from 'dns'
import { promisify } from 'util'

const resolveCname = promisify(dns.resolveCname)
const resolveTxt = promisify(dns.resolveTxt)
const resolveMx = promisify(dns.resolveMx)

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
  const errors: string[] = []
  let cnameRecords: string[] = []
  let txtRecords: string[] = []
  let mxRecords: string[] = []
  let cnameVerified = false
  let txtVerified = false

  try {
    const verificationToken = generateVerificationToken(userId, domain)

    try {
      cnameRecords = await resolveCname(domain)
      cnameVerified = cnameRecords.some(record =>
        record.includes('vercel-custom-domain') ||
        record.includes('cname.vercel-dns.com') ||
        record.includes('vercel-dns.com')
      )
      if (!cnameVerified && cnameRecords.length > 0) {
        errors.push(`CNAME does not point to our platform: ${cnameRecords.join(', ')}`)
      }
    } catch (error) {
      errors.push('No CNAME record found')
    }

    try {
      txtRecords = await resolveTxt(domain)
      txtVerified = txtRecords.some(record =>
        record.join('').includes(verificationToken) ||
        record.join('').includes('verification')
      )
      if (!txtVerified && txtRecords.length > 0) {
        errors.push(`TXT record does not contain verification token`)
      }
    } catch (error) {
      errors.push('No TXT record found')
    }

    try {
      const mx = await resolveMx(domain)
      mxRecords = mx.map(r => r.exchange)
    } catch (error) {
      // MX records are optional
    }

    const verified = cnameVerified && txtVerified

    if (verified) {
      await prisma.customDomain.update({
        where: { domain },
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
        txt: txtRecords,
        mx: mxRecords,
        verified: cnameVerified || txtVerified,
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
  const crypto = require('crypto')
  const hash = crypto.createHash('sha256')
  hash.update(`${userId}:${domain}:${process.env.JWT_SECRET}`)
  return `nextgen-verify-${hash.digest('hex').substring(0, 16)}`
}

export function getVerificationInstructions(domain: string, userId: string): {
  cname: { host: string; value: string }
  txt: { host: string; value: string }
} {
  const token = generateVerificationToken(userId, domain)
  return {
    cname: {
      host: domain,
      value: 'cname.vercel-dns.com',
    },
    txt: {
      host: domain,
      value: token,
    },
  }
}