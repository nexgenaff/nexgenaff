const { Client } = require('pg');

async function inventory(label, url) {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const tables = await client.query("select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name");
  console.log(label);
  for (const { table_name: tableName } of tables.rows) {
    const identifier = '"' + tableName.replaceAll('"', '""') + '"';
    const result = await client.query(`select count(*)::bigint as count from public.${identifier}`);
    console.log(`${tableName}|${result.rows[0].count}`);
  }
  await client.end();
}

Promise.all([
  inventory('SOURCE', process.env.SOURCE_URL),
  inventory('TARGET', process.env.TARGET_URL),
]).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
