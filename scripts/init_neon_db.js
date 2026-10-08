const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_0hniokXqVvl3@ep-aged-dawn-b5oeh3rf-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function init() {
  console.log('1. Connecting to Neon PostgreSQL...');
  const sql = neon(connectionString);

  console.log('2. Creating app_state table...');
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      key VARCHAR(50) PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('✅ app_state table ready.');

  console.log('3. Checking if appdata exists in Neon...');
  const existing = await sql`SELECT key, updated_at FROM app_state WHERE key = 'appdata'`;
  
  const localDbPath = path.join(__dirname, '../database/db_data.json');
  const localDb = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
  console.log(`Local db has ${localDb.users.length} users, ${localDb.products.length} products, ${localDb.categories.length} categories.`);

  if (existing && existing.length > 0) {
    console.log('appdata already exists in Neon DB (last updated:', existing[0].updated_at, ').');
  } else {
    console.log('4. Seeding complete database into Neon DB...');
    const dataJson = JSON.stringify(localDb);
    await sql`
      INSERT INTO app_state (key, data, updated_at)
      VALUES ('appdata', ${dataJson}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
    `;
    console.log('✅ Seeded full dataset into Neon PostgreSQL successfully!');
  }

  const check = await sql`SELECT data->'users' as users FROM app_state WHERE key = 'appdata'`;
  console.log(`✅ Neon DB verified. Total users in Neon DB: ${check[0].users.length}`);
}

init().catch(err => {
  console.error('❌ Error during Neon DB initialization:', err);
  process.exit(1);
});
