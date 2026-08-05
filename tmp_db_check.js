const fs = require('fs');
const { Client } = require('pg');
const envLines = fs.readFileSync('.env', 'utf8').split(/\r?\n/).filter(Boolean);
const env = Object.fromEntries(envLines.map(line => line.split('=', 2)));
const dbUrl = env.DATABASE_URL.replace(/^"|"$/g, '');
console.log('DB URL:', dbUrl);
const client = new Client({ connectionString: dbUrl });
(async () => {
  await client.connect();
  const cols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='offer_vaults' ORDER BY ordinal_position;");
  console.log('COLUMNS:', cols.rows);
  const count = await client.query('SELECT count(*) AS count FROM offer_vaults;');
  console.log('COUNT:', count.rows[0]);
  await client.end();
})().catch(err => {
  console.error('ERROR', err);
  process.exit(1);
});