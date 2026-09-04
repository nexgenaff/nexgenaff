const fetch = global.fetch || (await import('node-fetch')).default;
const base = 'http://localhost:3000';

async function login(username, password) {
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const setCookie = res.headers.get('set-cookie') || res.headers.get('Set-Cookie');
  const data = await res.json();
  return { data, setCookie };
}

function parseAuthTokenFromSetCookie(setCookie) {
  if (!setCookie) return null;
  const match = /auth-token=([^;]+)/.exec(setCookie);
  return match ? decodeURIComponent(match[1]) : null;
}

async function createOffer(cookie, offer) {
  const res = await fetch(`${base}/api/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: `auth-token=${cookie}` },
    body: JSON.stringify(offer),
  });
  return { status: res.status, body: await res.json() };
}

async function listOffers(cookie) {
  const res = await fetch(`${base}/api/offers`, {
    method: 'GET',
    headers: { Cookie: `auth-token=${cookie}` },
  });
  return { status: res.status, body: await res.json() };
}

(async () => {
  try {
    console.log('Logging in as admin...')
    const { data, setCookie } = await login('admin', 'admin123')
    console.log('Login response:', data)
    const token = parseAuthTokenFromSetCookie(setCookie) || data?.token
    if (!token) {
      console.error('No auth token found in login response.')
      process.exit(1)
    }

    console.log('Creating offer...')
    const offerPayload = {
      country: 'US',
      offerUrl: 'https://example.com/offer',
      isGlobal: false,
      isContentLocker: false,
      priority: 100,
      usaSecretRedirectEnabled: false,
      usaSecretRedirectPercentage: 50,
      rotationMode: 'PRIORITY'
    }

    const createRes = await createOffer(token, offerPayload)
    console.log('Create offer response status:', createRes.status)
    console.log('Create offer response body:', createRes.body)

    console.log('Listing offers...')
    const listRes = await listOffers(token)
    console.log('List offers status:', listRes.status)
    console.log('List offers body:', JSON.stringify(listRes.body, null, 2))
  } catch (err) {
    console.error('Test failed:', err)
    process.exit(1)
  }
})();
