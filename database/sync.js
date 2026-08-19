const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { readData, writeData } = require('./store');

async function runSync() {
  try {
    console.log('Reading database files...');
    const localDbPath = path.join(__dirname, 'db_data.json');
    const localDbRaw = fs.readFileSync(localDbPath, 'utf8');
    const localDb = JSON.parse(localDbRaw);

    console.log('Reading from Couchbase...');
    const remoteDb = await readData();

    console.log(`Original products count in Couchbase: ${remoteDb.products ? remoteDb.products.length : 0}`);
    console.log(`New products count to sync: ${localDb.products ? localDb.products.length : 0}`);

    // Update Couchbase products and categories
    remoteDb.products = localDb.products;
    remoteDb.categories = localDb.categories;

    console.log('Writing updated data back to Couchbase...');
    await writeData(remoteDb);

    console.log('✅ Couchbase updated with local product and category changes successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  }
}

runSync();
