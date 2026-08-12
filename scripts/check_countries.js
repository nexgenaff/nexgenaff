const { Client } = require('pg')

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EFQfmS3rp4Dh@ep-raspy-bar-aunm06yc-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

;(async () => {
  const client = new Client({ connectionString })
  try {
    await client.connect()
    const distinct = await client.query('select distinct(country) as country from offer_vaults order by country nulls first')
    console.log('distinct countries:', JSON.stringify(distinct.rows, null, 2))

    const matches = await client.query("select id, \"userId\" as user_id, country, \"isGlobal\", \"isContentLocker\", \"offerUrl\" from offer_vaults where upper(country) in ('BD','BG') or country ILIKE '%bangladesh%' or country ILIKE '%bulg%' order by country nulls first")
    console.log('bd/bg offers:', JSON.stringify(matches.rows, null, 2))
  } catch (err) {
    console.error(err)
  } finally {
    await client.end()
  }
})()
