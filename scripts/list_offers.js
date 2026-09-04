const { Client } = require('pg')

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EFQfmS3rp4Dh@ep-raspy-bar-aunm06yc-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const userIds = process.argv.slice(2)

;(async () => {
  if (userIds.length === 0) {
    console.error('Provide one or more user IDs as args')
    process.exit(1)
  }
  const client = new Client({ connectionString })
  try {
    await client.connect()
    const res = await client.query('select id, "userId" as user_id, country, "isGlobal", "isContentLocker", "offerUrl" from offer_vaults where "userId" = any($1)', [userIds])
    console.log(JSON.stringify(res.rows, null, 2))
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await client.end()
  }
})()
