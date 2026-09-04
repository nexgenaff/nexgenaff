import { NextRequest, NextResponse } from 'next/server'
import { landingPrisma } from '@/lib/db/landing-prisma'
import { renderLandingPageHtml } from '@/lib/utils/landing-page-render'
import { BotDetectionService } from '@/lib/services/bot-detection'

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
    const landingPage = await landingPrisma.landingPage.findFirst({
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
    <title>404 - Page Not Found</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Tomorrow', sans-serif;
        height: 100vh;
        background-image: linear-gradient(to top, #2e1753, #1f1746, #131537, #0d1028, #050819);
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
      }

      .text {
        position: absolute;
        top: 10%;
        color: #fff;
        text-align: center;
      }

      h1 {
        font-size: 50px;
      }

      .star {
        position: absolute;
        width: 2px;
        height: 2px;
        background: #fff;
        right: 0;
        animation: starTwinkle 3s infinite linear;
      }

      .astronaut img {
        width: 100px;
        position: absolute;
        top: 55%;
        animation: astronautFly 6s infinite linear;
      }

      @keyframes astronautFly {
        0% {
          left: -100px;
        }
        25% {
          top: 50%;
          transform: rotate(30deg);
        }
        50% {
          transform: rotate(45deg);
          top: 55%;
        }
        75% {
          top: 60%;
          transform: rotate(30deg);
        }
        100% {
          left: 110%;
          transform: rotate(45deg);
        }
      }

      @keyframes starTwinkle {
        0% {
          background: rgba(255,255,255,0.4);
        }
        25% {
          background: rgba(255,255,255,0.8);
        }
        50% {
          background: rgba(255,255,255,1);
        }
        75% {
          background: rgba(255,255,255,0.8);
        }
        100% {
          background: rgba(255,255,255,0.4);
        }
      }
    </style>
  </head>
  <body>
    <div class="text">
      <div>ERROR</div>
      <h1>404</h1>
      <hr>
      <div>Page Not Found</div>
    </div>

    <div class="astronaut">
      <img src="https://images.vexels.com/media/users/3/152639/isolated/preview/506b575739e90613428cdb399175e2c8-space-astronaut-cartoon-by-vexels.png" alt="Astronaut" class="src" />
    </div>

    <script>
      document.addEventListener('DOMContentLoaded', function() {
        var body = document.body;
        setInterval(createStar, 100);

        function createStar() {
          var right = Math.random() * 500;
          var top = Math.random() * screen.height;
          var star = document.createElement('div');
          star.classList.add('star');
          body.appendChild(star);
          star.style.top = top + 'px';

          function runStar() {
            if (right >= screen.width) {
              star.remove();
              return;
            }
            right += 3;
            star.style.right = right + 'px';
          }

          setInterval(runStar, 10);
        }
      });
    </script>
  </body>
</html>`

      return new NextResponse(notFoundHtml, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    }

    const userAgent = req.headers.get('user-agent') || ''
    const forwardedFor = req.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '0.0.0.0'
    const botResult = await new BotDetectionService().detect(userAgent, ipAddress)

    if (!botResult.isBot) {
      await landingPrisma.landingPage.update({
        where: { id: landingPage.id },
        data: { totalClicks: { increment: 1 } },
      })
    }

    // Render HTML with variables replaced, including tracking link
    const renderedHtml = renderLandingPageHtml(landingPage.template?.htmlContent || '', {
      headline: landingPage.headline || '',
      description: landingPage.description || '',
      imageUrl: landingPage.imageUrl || '',
      buttonText: landingPage.buttonText || '',
      linkUrl: landingPage.trackingUrl || '',
    })

    // Return rendered HTML with strict security headers
    const response = new NextResponse(renderedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'self' https:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src *; font-src *;",
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
      },
    })

    return response
  } catch (error) {
    console.error('Error handling landing page:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
