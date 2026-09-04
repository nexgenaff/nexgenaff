const crypto = require('crypto');
const fetch = global.fetch || require('node-fetch');

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function generateToken(userId = 'local-owner') {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ userId, iat: Math.floor(Date.now() / 1000) }));
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${header}.${payload}.${signature}`;
}

async function run() {
  const token = generateToken(process.argv[2] || 'local-owner');
  const base = 'http://localhost:3000';
  console.log('Using token:', token.slice(0, 24) + '...');

  try {
    console.log('\nPOST /api/offers');
    const offerResp = await fetch(`${base}/api/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`,
      },
      body: JSON.stringify({ country: 'US', groupName: 'smoke', offerUrl: 'https://example.com', isGlobal: false }),
    });
    console.log('Status:', offerResp.status);
    console.log(await offerResp.text());
  } catch (e) { console.error('Offer error:', e.message); }

  try {
    console.log('\nPOST /api/domains');
    const domResp = await fetch(`${base}/api/domains`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${token}`,
      },
      body: JSON.stringify({ domain: 'track-smoke.example.com' }),
    });
    console.log('Status:', domResp.status);
    console.log(await domResp.text());
  } catch (e) { console.error('Domain error:', e.message); }

  try {
    console.log('\nGET /api/analytics/dashboard');
    const dash = await fetch(`${base}/api/analytics/dashboard`, {
      headers: { 'Cookie': `auth-token=${token}` },
    });
    console.log('Status:', dash.status);
    console.log(await dash.text());
  } catch (e) { console.error('Dashboard error:', e.message); }

  try {
    console.log('\nGET /api/analytics/recent');
    const recent = await fetch(`${base}/api/analytics/recent`, {
      headers: { 'Cookie': `auth-token=${token}` },
    });
    console.log('Status:', recent.status);
    console.log(await recent.text());
  } catch (e) { console.error('Recent error:', e.message); }
}

run().catch(e => { console.error(e); process.exit(1); });
