const { Client } = require('pg');
const fs = require('fs');

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Set DATABASE_URL env var before running.');
    process.exit(2);
  }
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  try {
    const res = await client.query('SELECT * FROM offer_vaults');
    const out = JSON.stringify(res.rows, null, 2);
    const file = 'prod-backup-offer_vaults.json';
    fs.writeFileSync(file, out);
    console.log('Wrote', file, 'with', res.rowCount, 'rows');
  } finally {
    await client.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
