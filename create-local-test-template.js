const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestTemplate() {
  try {
    // Get the owner user
    const ownerUser = await prisma.user.findUnique({
      where: { username: 'owner' },
    })

    if (!ownerUser) {
      console.error('Owner user not found')
      return
    }

    console.log(`Creating template for user: ${ownerUser.username} (${ownerUser.id})`)

    const template = await prisma.landingPageTemplate.create({
      data: {
        name: 'Local Test Template',
        description: 'A simple test template created locally for testing purposes',
        thumbnail: 'https://via.placeholder.com/300x200?text=Local+Test+Template',
        createdBy: ownerUser.id,
        htmlContent:
          '<div class="hero"><h1>{headline}</h1><p>{description}</p><img src="{imageUrl}" alt="Hero" /><button>{buttonText}</button></div>',
        cssStyles: `.hero { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; background: linear-gradient(135deg, {primaryColor} 0%, {secondaryColor} 100%); } .hero h1 { font-size: 48px; color: white; margin: 0 0 20px 0; } .hero p { font-size: 18px; color: rgba(255,255,255,0.8); margin: 0 0 30px 0; } .hero img { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 30px; } .hero button { padding: 12px 30px; font-size: 16px; background: white; color: {primaryColor}; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }`,
      },
    })

    console.log('✅ Test template created successfully!')
    console.log(`Template ID: ${template.id}`)
    console.log(`Template Name: ${template.name}`)
  } catch (error) {
    console.error('Error creating template:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createTestTemplate()
