import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { decryptTelegramToken, sendTelegramMessage } from '@/lib/services/telegram'

function firstValue(value: string | null) { return value?.trim() || null }
function isUnresolvedToken(value: string | null) {
  return Boolean(value && (/^#.+#$/.test(value) || /^\{.+\}$/.test(value)))
}

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  return ingestPostback(request, (await context.params).token)
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  const token = (await context.params).token
  const contentType = request.headers.get('content-type') || ''
  const params = contentType.includes('application/json')
    ? new URLSearchParams(Object.entries(await request.json()).map(([key, value]) => [key, String(value)]))
    : new URLSearchParams(await request.text())
  return ingestPostback(request, token, params)
}

export async function ingestPostback(request: Request, token: string, bodyParams?: URLSearchParams) {
  const params = bodyParams || new URL(request.url).searchParams
  const config = await prisma.postbackConfig.findFirst({ where: { token, isActive: true } })
  if (!config) return NextResponse.json({ error: 'Invalid postback' }, { status: 404 })
  const value = (names: string[]) => names.map((name) => firstValue(params.get(name))).find(Boolean) || null
  const payoutRaw = value(['payout', '#payout#'])
  if (isUnresolvedToken(payoutRaw)) {
    return NextResponse.json({ error: 'Marketplace did not replace the payout token. Use a public URL and enable token substitution.' }, { status: 400 })
  }
  const payoutValue = Number(payoutRaw)
  const lead = await prisma.conversionLead.create({
    data: {
      userId: config.userId, postbackId: config.id,
      payout: Number.isFinite(payoutValue) ? payoutValue : null,
      sub1: value(['s1', 'subid', '#s1#']),
      sub2: value(['s2', 'subid2', '#s2#']), sub3: value(['s3', 'subid3', '#s3#']), sub4: value(['s4', 'subid4', '#s4#']),
    },
  })
  const telegram = await prisma.telegramNotification.findUnique({ where: { userId: config.userId } })
  if (telegram?.isActive) {
    const subIds = [lead.sub1, lead.sub2, lead.sub3, lead.sub4].filter(Boolean).join(' | ') || '-'
    try {
      const telegramToken = decryptTelegramToken(telegram.botTokenEncrypted)
      void sendTelegramMessage(telegramToken, telegram.channelId, `New ${config.label} conversion\nPayout: $${(lead.payout || 0).toFixed(2)}\nSubIDs: ${subIds}`).catch((error) => console.error('Telegram notification failed:', error))
    } catch (error) {
      console.error('Telegram token decryption failed:', error)
    }
  }
  return NextResponse.json({ success: true, id: lead.id })
}