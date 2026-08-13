const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function listTemplates() {
  try {
    const templates = await prisma.landingPageTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
      },
      take: 5,
    })

    console.log('✅ Templates in database:')
    templates.forEach((t) => console.log(`- ${t.name} (ID: ${t.id})`))
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

listTemplates()
