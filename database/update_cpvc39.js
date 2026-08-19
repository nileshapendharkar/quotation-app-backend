const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_cpvc_39');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.name = 'CPVC BALL VALVE (LONG HANDLE)';
p.description = 'CPVC BALL VALVE (LONG HANDLE). Available sizes: 3/4, 1, 1 1/4, 1 1/2, 2.';

p.sizes = ['3/4', '1', '1 1/4', '1 1/2', '2'];

p.packSizes = {
  '3/4': 40,
  '1': 30,
  '1 1/4': 20,
  '1 1/2': 14,
  '2': 10
};

p.sizeProductCodes = {
  '3/4': 'FG-400447',
  '1': 'FG-400448',
  '1 1/4': 'FG-400449',
  '1 1/2': 'FG-400450',
  '2': 'FG-400451'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Updated product:', p.name);
console.log('Sizes:', p.sizes);
console.log('PackSizes:', JSON.stringify(p.packSizes, null, 2));
console.log('SizeProductCodes:', JSON.stringify(p.sizeProductCodes, null, 2));
