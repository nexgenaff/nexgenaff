import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  try {
    const adminPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@nextgen.com',
        password: adminPassword,
        role: 'ADMIN',
      },
    })

    console.log(`✅ Admin user created: ${admin.username}`)

    await prisma.offerVault.upsert({
      where: { 
        country_userId: { 
          country: 'GLOBAL', 
          userId: admin.id 
        } 
      },
      update: {},
      create: {
        country: 'GLOBAL',
        offerUrl: 'https://smartlink.com/?s1=',
        isGlobal: true,
        isActive: true,
        userId: admin.id,
      },
    })

    console.log('✅ Global smart link created')

    const sampleOffers = [
      { country: 'US', offerUrl: 'https://affiliate.com/us/?s1=' },
      { country: 'GB', offerUrl: 'https://affiliate.com/uk/?s1=' },
      { country: 'CA', offerUrl: 'https://affiliate.com/ca/?s1=' },
      { country: 'AU', offerUrl: 'https://affiliate.com/au/?s1=' },
    ]

    for (const offer of sampleOffers) {
      await prisma.offerVault.upsert({
        where: { 
          country_userId: { 
            country: offer.country, 
            userId: admin.id 
          } 
        },
        update: {},
        create: {
          country: offer.country,
          offerUrl: offer.offerUrl,
          isActive: true,
          isGlobal: false,
          userId: admin.id,
        },
      })
    }

    console.log('✅ Sample offers created')
    console.log('🎉 Seeding complete!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })