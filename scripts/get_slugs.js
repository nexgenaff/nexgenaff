const { Client } = require('pg')

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EFQfmS3rp4Dh@ep-raspy-bar-aunm06yc-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

;(async () => {
  const client = new Client({ connectionString })
  try {
    await client.connect()
    const res = await client.query('select id, slug, "userId" as user_id from link_accounts limit 10')
    console.log(JSON.stringify(res.rows, null, 2))
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await client.end()
  }
})()
