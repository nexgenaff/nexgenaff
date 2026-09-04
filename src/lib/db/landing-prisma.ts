import { PrismaClient } from '@/generated/landing-prisma'

const globalForLandingPrisma = global as unknown as {
  landingPrisma: PrismaClient | undefined
}

export const landingPrisma =
  globalForLandingPrisma.landingPrisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForLandingPrisma.landingPrisma = landingPrisma
}
