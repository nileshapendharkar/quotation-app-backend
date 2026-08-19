const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_cpvc_12');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.name = 'CPVC NAIL CLAMP';
p.description = 'CPVC NAIL CLAMP. Available sizes: 3/4, 1, 1 1/4, 1 1/2, 2.';

p.sizes = ['3/4', '1', '1 1/4', '1 1/2', '2'];

p.packSizes = {
  '3/4': 1000,
  '1': 600,
  '1 1/4': 500,
  '1 1/2': 300,
  '2': 150
};

p.sizeProductCodes = {
  '3/4': 'FG-400538',
  '1': 'FG-400473',
  '1 1/4': 'FG-400539',
  '1 1/2': 'FG-400540',
  '2': 'FG-400541'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Updated product:', p.name);
console.log('Sizes:', p.sizes);
console.log('PackSizes:', JSON.stringify(p.packSizes, null, 2));
console.log('SizeProductCodes:', JSON.stringify(p.sizeProductCodes, null, 2));
