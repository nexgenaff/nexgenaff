import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { createUserSafe } from '@/lib/db/user'
import { getCorsHeaders } from '@/config/cors'

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || null

  try {
    const body = await request.json()
    const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : ''
    const contractNumber = typeof body?.contractNumber === 'string' ? body.contractNumber.trim() : ''
    const telegramUsername = typeof body?.telegramUsername === 'string' ? body.telegramUsername.trim() : ''
    const bkashNumber = typeof body?.bkashNumber === 'string' ? body.bkashNumber.trim() : ''
    const username = typeof body?.username === 'string' ? body.username.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const password = typeof body?.password === 'string' ? body.password.trim() : ''
    const captchaPrompt = typeof body?.captchaPrompt === 'string' ? body.captchaPrompt.trim() : ''
    const captchaAnswer = typeof body?.captchaAnswer === 'number' ? body.captchaAnswer : Number(body?.captchaAnswer)

    if (!fullName || !contractNumber || !telegramUsername || !bkashNumber || !username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required for manager signup' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    if (!captchaPrompt) {
      return NextResponse.json(
        { error: 'Please solve the captcha correctly before signing up' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    const expectedValue = captchaPrompt
      .split('+')
      .map((part: string) => Number(part.trim()))
      .reduce((sum: number, value: number) => sum + value, 0)

    if (!Number.isInteger(captchaAnswer) || captchaAnswer !== expectedValue) {
      return NextResponse.json(
        { error: 'Please solve the captcha correctly before signing up' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    const existingUsers = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM users
      WHERE username = ${username} OR email = ${email}
      LIMIT 1
    `

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let createData = {
      username,
      email,
      password: hashedPassword,
      role: 'MANAGER',
      status: 'PENDING',
      ...(fullName ? { fullName } : {}),
      ...(contractNumber ? { contractNumber } : {}),
      ...(telegramUsername ? { telegramUsername } : {}),
      ...(bkashNumber ? { bkashNumber } : {}),
    } as Prisma.UserCreateInput

    const user = await createUserSafe(createData)

    return NextResponse.json(
      {
        success: true,
        requiresApproval: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          status: user.status,
        },
      },
      { headers: getCorsHeaders(origin) }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500, headers: getCorsHeaders(origin) }
    )
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '*'
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  })
}
