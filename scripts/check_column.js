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
    const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='offer_vaults' AND column_name='usaSecretRedirectEnabled'`);
    console.log(res.rows);
  } finally {
    await client.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
