const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestTemplate() {
  try {
    // Get a system user
    let systemUser = await prisma.user.findUnique({
      where: { username: 'system' },
    })

    if (!systemUser) {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      })

      if (!adminUser) {
        console.error('No admin user found. Please create an admin user first.')
        return
      }
      systemUser = adminUser
    }

    // Create test template
    const testTemplate = await prisma.landingPageTemplate.create({
      data: {
        name: 'Test Template',
        description: 'A simple test template for development',
        thumbnail: 'https://via.placeholder.com/300x200?text=Test+Template',
        createdBy: systemUser.id,
        htmlContent: `<div class="test-container">
  <div class="test-header">
    <h1>{headline}</h1>
    <p>{description}</p>
  </div>
  <div class="test-body">
    {imageUrl && '<img src="{imageUrl}" alt="Test" class="test-image" />'}
    <a href="#" class="test-button">{buttonText}</a>
  </div>
</div>`,
        cssStyles: `body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, {primaryColor}20 0%, {secondaryColor}20 100%);
  min-height: 100vh;
}

.test-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.test-header {
  text-align: center;
  margin-bottom: 40px;
}

.test-header h1 {
  color: {primaryColor};
  font-size: 42px;
  margin: 0 0 20px 0;
  font-weight: 700;
}

.test-header p {
  color: #666;
  font-size: 18px;
  margin: 0;
  line-height: 1.6;
}

.test-body {
  text-align: center;
  width: 100%;
}

.test-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.test-button {
  display: inline-block;
  padding: 14px 36px;
  background: linear-gradient(135deg, {primaryColor} 0%, {secondaryColor} 100%);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.test-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}`,
      },
    })

    console.log('✅ Test template created successfully!')
    console.log(`Template ID: ${testTemplate.id}`)
    console.log(`Template Name: ${testTemplate.name}`)
    console.log('\nYou can now use this template in the Landing Page Builder!')
  } catch (error) {
    console.error('Error creating test template:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createTestTemplate()
