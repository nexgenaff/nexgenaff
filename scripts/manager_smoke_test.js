const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = global.fetch || require('node-fetch');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

async function ensureManager() {
  const username = process.argv[2] || 'smoke_manager';
  let user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    const hashed = await bcrypt.hash('password', 10);
    user = await prisma.user.create({ data: { username, email: `${username}@example.com`, password: hashed, role: 'MANAGER' } });
    console.log('Created manager user:', user.id);
  } else {
    console.log('Found existing manager user:', user.id, user.role);
    if (user.role !== 'MANAGER') {
      try {
        user = await prisma.user.update({ where: { id: user.id }, data: { role: 'MANAGER' } });
        console.log('Updated role to MANAGER');
      } catch (e) {
        console.error('Failed to update role:', e.message);
      }
    }
  }
  return user;
}

function generateToken(userId) {
  return jwt.sign({ userId, iat: Math.floor(Date.now() / 1000) }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '86400s' });
}

async function run() {
  const user = await ensureManager();
  const token = generateToken(user.id);
  console.log('Manager token (truncated):', token.slice(0, 32) + '...');

  const base = 'http://localhost:3000';

  try {
    console.log('\nGET /api/analytics/dashboard as manager');
    const dash = await fetch(`${base}/api/analytics/dashboard`, { headers: { Cookie: `auth-token=${token}` } });
    console.log('Status:', dash.status);
    console.log(await dash.text());
  } catch (e) { console.error('Dashboard error:', e.message); }

  try {
    console.log('\nGET /api/analytics/recent as manager');
    const recent = await fetch(`${base}/api/analytics/recent`, { headers: { Cookie: `auth-token=${token}` } });
    console.log('Status:', recent.status);
    console.log(await recent.text());
  } catch (e) { console.error('Recent error:', e.message); }

  await prisma.$disconnect();
}

run().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
