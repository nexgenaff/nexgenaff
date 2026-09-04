import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTemplates() {
  try {
    // Check if templates already exist
    const existingTemplates = await prisma.landingPageTemplate.findMany()
    
    if (existingTemplates.length > 0) {
      console.log('Templates already exist. Skipping seed.')
      return
    }

    // Create default templates
    const template1 = await prisma.landingPageTemplate.create({
      data: {
        name: 'Modern Offer',
        description: 'Clean and modern design with gradient backgrounds',
        thumbnail: 'https://via.placeholder.com/300x200?text=Modern+Offer',
        createdBy: 'system',
        htmlContent: `
<div class="landing-container modern">
  <div class="hero-section">
    <h1 class="headline">{headline}</h1>
    <p class="subtext">{description}</p>
    {imageUrl && '<img src="{imageUrl}" alt="Offer" class="hero-image" />'}
  </div>
  <div class="cta-section">
    <a href="#" class="cta-button">{buttonText}</a>
  </div>
</div>
        `,
      },
    })

    const template2 = await prisma.landingPageTemplate.create({
      data: {
        name: 'Minimal Design',
        description: 'Simple and minimal design for maximum conversions',
        thumbnail: 'https://via.placeholder.com/300x200?text=Minimal+Design',
        createdBy: 'system',
        htmlContent: `
<div class="landing-container minimal">
  <div class="content">
    <h1>{headline}</h1>
    <p>{description}</p>
    {imageUrl && '<img src="{imageUrl}" alt="Offer" />'}
    <button class="btn">{buttonText}</button>
  </div>
</div>
        `,
      },
    })

    const template3 = await prisma.landingPageTemplate.create({
      data: {
        name: 'Dark Gradient',
        description: 'Modern dark theme with vibrant gradients',
        thumbnail: 'https://via.placeholder.com/300x200?text=Dark+Gradient',
        createdBy: 'system',
        htmlContent: `
<div class="landing-container dark">
  <div class="stars"></div>
  <div class="content-wrapper">
    <h1>{headline}</h1>
    <p>{description}</p>
    {imageUrl && '<img src="{imageUrl}" alt="Offer" class="offer-image" />'}
    <a href="#" class="btn-primary">{buttonText}</a>
  </div>
</div>
        `,
      },
    })

    console.log('✅ Templates seeded successfully!')
    console.log(`Created ${[template1, template2, template3].length} templates`)
  } catch (error) {
    console.error('Error seeding templates:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedTemplates()
