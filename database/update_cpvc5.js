const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_cpvc_5');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.name = 'CPVC COUPLER';
p.description = 'CPVC COUPLER. Available sizes: 3/4, 1, 1 1/4, 1 1/2, 2.';

p.sizes = ['3/4', '1', '1 1/4', '1 1/2', '2'];

p.packSizes = {
  '3/4': 300,
  '1': 160,
  '1 1/4': 80,
  '1 1/2': 60,
  '2': 30
};

p.sizeProductCodes = {
  '3/4': 'FG-400407',
  '1': 'FG-400408',
  '1 1/4': 'FG-400673',
  '1 1/2': 'FG-400482',
  '2': 'FG-400483'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Updated product:', p.name);
console.log('Sizes:', p.sizes);
console.log('PackSizes:', JSON.stringify(p.packSizes, null, 2));
console.log('SizeProductCodes:', JSON.stringify(p.sizeProductCodes, null, 2));
