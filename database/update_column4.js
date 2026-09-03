const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_column_4');
if (!p) {
  console.error('Product prod_column_4 not found!');
  process.exit(1);
}

p.name = 'COLOUMN PIPE COUPLER STANDARD PLUS';
p.description = 'COLOUMN PIPE COUPLER STANDARD PLUS.';
p.sizes = [];
delete p.packSizes;
delete p.sizeProductCodes;
delete p.packings;
delete p.packing;
delete p.packSize;

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Successfully updated prod_column_4:', JSON.stringify(p, null, 2));
