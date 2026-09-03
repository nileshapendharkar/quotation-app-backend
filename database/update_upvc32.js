const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_upvc_32');
if (!p) {
  console.error('Product prod_upvc_32 not found!');
  process.exit(1);
}

p.name = 'UPVC REDUCER BRASS ELBOW';
p.description = 'UPVC REDUCER BRASS ELBOW.';
p.sizes = [];
delete p.packSizes;
delete p.sizeProductCodes;
delete p.packings;
delete p.packing;
delete p.packSize;

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Successfully updated prod_upvc_32:', JSON.stringify(p, null, 2));
