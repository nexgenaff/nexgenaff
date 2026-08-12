const { Client } = require('pg')

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_EFQfmS3rp4Dh@ep-raspy-bar-aunm06yc-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const slug = process.argv[2] || 'tesrr'

;(async () => {
  const client = new Client({ connectionString })
  try {
    await client.connect()
    const linkRes = await client.query('select id, slug, "userId" as user_id, "offerGroupName" as offer_group_name, "isActive" from link_accounts where slug=$1 limit 1', [slug])
    if (!linkRes.rows.length) {
      console.error('Link not found for slug', slug)
      process.exit(1)
    }
    const link = linkRes.rows[0]
    console.log('link:', link)

    const userRes = await client.query('select id, username, role, status from users where id=$1', [link.user_id])
    if (!userRes.rows.length) {
      console.error('User not found', link.user_id)
      process.exit(1)
    }
    const user = userRes.rows[0]
    console.log('user:', user)

    const ownerRes = await client.query("select id, username, role from users where username = 'owner' limit 1")
    console.log('owner user row:', ownerRes.rows)

    const userOffers = await client.query('select id, country, "groupName" as group_name, "isGlobal", "isContentLocker", priority, "rotationMode", "offerUrl" from offer_vaults where "userId"=$1 order by "isGlobal" desc, country nulls first, "groupName" nulls first, priority desc', [link.user_id])
    console.log('user offers:', JSON.stringify(userOffers.rows, null, 2))

    if (ownerRes.rows.length) {
      const ownerOffers = await client.query('select id, country, "groupName" as group_name, "isGlobal", "isContentLocker", priority, "rotationMode", "offerUrl" from offer_vaults where "userId"=$1 order by "isGlobal" desc, country nulls first, "groupName" nulls first, priority desc', [ownerRes.rows[0].id])
      console.log('owner offers:', JSON.stringify(ownerOffers.rows, null, 2))
    }

    const offerIdsRes = await client.query('select id, username, role from users where id in ($1, $2)', [link.user_id, ownerRes.rows[0]?.id || ''])
    console.log('offer selection candidate users:', JSON.stringify(offerIdsRes.rows, null, 2))
  } catch (err) {
    console.error(err)
  } finally {
    await client.end()
  }
})()
