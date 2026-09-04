import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params

  return NextResponse.json({
    name: 'Afficixo Stats',
    short_name: 'Afficixo Stats',
    start_url: `/stats/${publicId}`,
    scope: `/stats/${publicId}`,
    display: 'standalone',
    orientation: 'portrait-primary',
    theme_color: '#05070b',
    background_color: '#05070b',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  })
}