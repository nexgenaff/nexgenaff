const { Client } = require('pg');

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Set DATABASE_URL env var before running.');
    process.exit(2);
  }
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  try {
    const sql = 'ALTER TABLE offer_vaults ADD COLUMN IF NOT EXISTS "usaSecretRedirectEnabled" boolean DEFAULT false;';
    console.log('Running:', sql);
    await client.query(sql);
    console.log('Column ensured.');
  } finally {
    await client.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
