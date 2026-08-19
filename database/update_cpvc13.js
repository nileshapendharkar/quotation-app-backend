const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_cpvc_13');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.name = 'CPVC TEE';
p.description = 'CPVC TEE. Available sizes: 3/4, 1, 1 1/4, 1 1/2, 2.';

p.sizes = ['3/4', '1', '1 1/4', '1 1/2', '2'];

p.packSizes = {
  '3/4': 160,
  '1': 80,
  '1 1/4': 40,
  '1 1/2': 30,
  '2': 12
};

p.sizeProductCodes = {
  '3/4': 'FG-400405',
  '1': 'FG-400406',
  '1 1/4': 'N/A',
  '1 1/2': 'FG-400481',
  '2': 'FG-400534'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Updated product:', p.name);
console.log('Sizes:', p.sizes);
console.log('PackSizes:', JSON.stringify(p.packSizes, null, 2));
console.log('SizeProductCodes:', JSON.stringify(p.sizeProductCodes, null, 2));
