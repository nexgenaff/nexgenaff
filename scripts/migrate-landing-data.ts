import { PrismaClient } from '@prisma/client'
import { PrismaClient as LandingPrismaClient } from '../src/generated/landing-prisma'

const source = new PrismaClient()
const target = new LandingPrismaClient()

async function main() {
  const templates = await source.landingPageTemplate.findMany()
  const pages = await source.landingPage.findMany()

  await target.$transaction(async (tx) => {
    for (const template of templates) {
      await tx.landingPageTemplate.upsert({
        where: { id: template.id },
        update: {
          name: template.name,
          description: template.description,
          thumbnail: template.thumbnail,
          htmlContent: template.htmlContent,
          customText: template.customText,
          isActive: template.isActive,
          updatedAt: template.updatedAt,
          createdBy: template.createdBy,
        },
        create: {
          id: template.id,
          name: template.name,
          description: template.description,
          thumbnail: template.thumbnail,
          htmlContent: template.htmlContent,
          customText: template.customText,
          isActive: template.isActive,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          createdBy: template.createdBy,
        },
      })
    }

    for (const page of pages) {
      await tx.landingPage.upsert({
        where: { id: page.id },
        update: {
          subdomain: page.subdomain,
          trackingUrl: page.trackingUrl,
          templateId: page.templateId,
          userId: page.userId,
          headline: page.headline,
          description: page.description,
          imageUrl: page.imageUrl,
          primaryColor: page.primaryColor,
          secondaryColor: page.secondaryColor,
          buttonText: page.buttonText,
          isPublished: page.isPublished,
          publishedAt: page.publishedAt,
          totalClicks: page.totalClicks,
          updatedAt: page.updatedAt,
        },
        create: {
          id: page.id,
          subdomain: page.subdomain,
          trackingUrl: page.trackingUrl,
          templateId: page.templateId,
          userId: page.userId,
          headline: page.headline,
          description: page.description,
          imageUrl: page.imageUrl,
          primaryColor: page.primaryColor,
          secondaryColor: page.secondaryColor,
          buttonText: page.buttonText,
          isPublished: page.isPublished,
          publishedAt: page.publishedAt,
          totalClicks: page.totalClicks,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
        },
      })
    }
  }, {
    maxWait: 10000,
    timeout: 120000,
  })

  console.log(`Migrated ${templates.length} templates and ${pages.length} landing pages.`)
}

main()
  .catch((error) => {
    console.error('Landing data migration failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await source.$disconnect()
    await target.$disconnect()
  })
