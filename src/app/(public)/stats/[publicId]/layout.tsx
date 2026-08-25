import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>
}): Promise<Metadata> {
  const { publicId } = await params

  return {
    title: 'Afficixo Stats',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'Afficixo Stats',
    },
    manifest: `/stats/${publicId}/manifest.webmanifest`,
  }
}

export default function PublicStatsLayout({ children }: { children: React.ReactNode }) {
  return children
}