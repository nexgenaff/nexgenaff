import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { renderLandingPageHtml } from '@/lib/utils/landing-page-render'

const prisma = new PrismaClient()

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    // Await params (required for Next.js 16)
    const { subdomain } = await params
    const normalizedSubdomain = subdomain.toLowerCase()

    // Find the landing page in a case-insensitive way to avoid mismatches
    // between host-derived subdomains and DB records.
    const landingPage = await prisma.landingPage.findFirst({
      where: {
        subdomain: {
          equals: normalizedSubdomain,
          mode: 'insensitive',
        },
      },
      include: { template: true },
    })

    if (!landingPage || !landingPage.isPublished) {
      const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>404 — Landing page not found</title>
    <style>
      :root {
        --bg-1: #0f172a;
        --bg-2: #111827;
        --panel: rgba(15, 23, 42, 0.75);
        --line: rgba(148, 163, 184, 0.18);
        --text: #e2e8f0;
        --muted: #a5b4cf;
        --cyan: #22d3ee;
        --violet: #8b5cf6;
        --pink: #f472b6;
      }

      * { box-sizing: border-box; }

      html, body {
        margin: 0;
        width: 100%;
        min-height: 100%;
        font-family: Inter, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top, rgba(34, 211, 238, 0.18), transparent 35%),
          radial-gradient(circle at bottom right, rgba(139, 92, 246, 0.2), transparent 35%),
          linear-gradient(135deg, var(--bg-1), var(--bg-2));
        color: var(--text);
      }

      body {
        display: grid;
        place-items: center;
        min-height: 100vh;
        overflow: hidden;
      }

      .scene {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: min(92vw, 760px);
        min-height: 520px;
        padding: 2.5rem 2rem;
        border: 1px solid var(--line);
        border-radius: 28px;
        background: rgba(15, 23, 42, 0.62);
        backdrop-filter: blur(18px);
        box-shadow: 0 30px 80px rgba(15, 23, 42, 0.6);
        overflow: hidden;
      }

      .scene::before,
      .scene::after {
        content: "";
        position: absolute;
        width: 320px;
        height: 320px;
        border-radius: 50%;
        filter: blur(28px);
        opacity: 0.7;
        animation: float 12s ease-in-out infinite alternate;
      }

      .scene::before {
        background: rgba(34, 211, 238, 0.18);
        top: -80px;
        left: -40px;
      }

      .scene::after {
        background: rgba(139, 92, 246, 0.19);
        right: -60px;
        bottom: -90px;
        animation-delay: 1.7s;
      }

      .status {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: end;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .digit {
        font-size: clamp(5rem, 18vw, 11rem);
        line-height: 0.85;
        font-weight: 900;
        letter-spacing: -0.08em;
        background: linear-gradient(135deg, var(--cyan), var(--violet), var(--pink));
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: pulse 2.4s ease-in-out infinite;
        text-shadow: 0 0 32px rgba(34, 211, 238, 0.45);
      }

      .title {
        position: relative;
        z-index: 1;
        margin: 0.2rem 0 0.7rem;
        font-size: clamp(1.8rem, 4vw, 3rem);
        font-weight: 800;
        letter-spacing: -0.04em;
      }

      .subtitle {
        position: relative;
        z-index: 1;
        max-width: 620px;
        margin: 0;
        color: var(--muted);
        font-size: 1.06rem;
        line-height: 1.7;
        text-align: center;
      }

      .chip {
        position: relative;
        z-index: 1;
        margin-top: 1.6rem;
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.8rem 1.1rem;
        border: 1px solid rgba(34, 211, 238, 0.28);
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.7);
        color: var(--text);
        font-size: 0.9rem;
        letter-spacing: 0.03em;
      }

      .chip::before {
        content: "";
        width: 0.7rem;
        height: 0.7rem;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--cyan), var(--violet));
        box-shadow: 0 0 15px rgba(34, 211, 238, 0.9);
        animation: blink 1.6s ease-in-out infinite;
      }

      @keyframes float {
        0% { transform: translate3d(0, 0, 0) scale(1); }
        100% { transform: translate3d(24px, -18px, 0) scale(1.08); }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.06); opacity: 0.92; }
      }

      @keyframes blink {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
    </style>
  </head>
  <body>
    <main class="scene" aria-live="polite">
      <div class="status">
        <div class="digit">4</div>
        <div class="digit">0</div>
        <div class="digit">4</div>
      </div>
      <h1 class="title">Landing page not found</h1>
      <p class="subtitle">
        This subdomain is not publishing a live landing page yet. Check the link or create a landing page to start tracking traffic.
      </p>
      <div class="chip">No landing page is currently active on this host</div>
    </main>
  </body>
</html>`

      return new NextResponse(notFoundHtml, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    }

    // Increment click count
    await prisma.landingPage.update({
      where: { id: landingPage.id },
      data: { totalClicks: { increment: 1 } },
    })

    // Render HTML with variables replaced, including tracking link
    const renderedHtml = renderLandingPageHtml(landingPage.template?.htmlContent || '', {
      headline: landingPage.headline || '',
      description: landingPage.description || '',
      imageUrl: landingPage.imageUrl || '',
      buttonText: landingPage.buttonText || '',
      linkUrl: landingPage.trackingUrl || '',
    })

    // Return rendered HTML
    return new NextResponse(renderedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error handling landing page:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
