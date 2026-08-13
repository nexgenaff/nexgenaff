const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateOwnerRole() {
  try {
    // Update the "owner" user to have OWNER role
    const updated = await prisma.user.update({
      where: { username: 'owner' },
      data: { role: 'OWNER' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    })

    console.log('✅ User role updated:')
    console.log(JSON.stringify(updated, null, 2))
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

updateOwnerRole()
