import { NextRequest, NextResponse } from 'next/server'
import { landingPrisma } from '@/lib/db/landing-prisma'
import { getShortenerAccess } from '@/app/api/url-shortener/route'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await getShortenerAccess(req)
    if (!access) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const shortUrl = await landingPrisma.landingPage.findUnique({
      where: { id },
      select: { id: true, userId: true, template: { select: { name: true } } },
    })

    if (!shortUrl || shortUrl.template.name !== 'URL Shortener') {
      return NextResponse.json({ error: 'Short URL not found' }, { status: 404 })
    }

    if (!access.showAll && shortUrl.userId !== access.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await landingPrisma.landingPage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting short URL:', error)
    return NextResponse.json({ error: 'Failed to delete short URL' }, { status: 500 })
  }
}
