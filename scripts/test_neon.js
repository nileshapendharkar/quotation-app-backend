const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0hniokXqVvl3@ep-aged-dawn-b5oeh3rf-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function test() {
  console.log('Connecting to Neon PostgreSQL...');
  const sql = neon(connectionString);
  const rows = await sql`SELECT 1 as result, NOW() as current_time`;
  console.log('✅ NEON CONNECTION SUCCESSFUL!');
  console.log('Result:', rows);
}

test().catch(err => {
  console.error('❌ Connection failed:', err);
  process.exit(1);
});
