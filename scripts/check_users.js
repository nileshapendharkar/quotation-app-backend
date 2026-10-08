const { neon } = require('@neondatabase/serverless');

require('dotenv').config();
const connStr = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0hniokXqVvl3@ep-aged-dawn-b5oeh3rf-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function check() {
  const sql = neon(connStr);
  const rows = await sql`SELECT data->'users' as users FROM app_state WHERE key = 'appdata'`;
  console.log(JSON.stringify(rows[0].users, null, 2));
}

check().catch(console.error);
