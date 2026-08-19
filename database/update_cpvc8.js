const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_cpvc_8');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.name = 'CPVC ELBOW 90';
p.description = 'CPVC ELBOW 90. Available sizes: 3/4, 1, 1 1/4, 1 1/2, 2.';

p.sizes = ['3/4', '1', '1 1/4', '1 1/2', '2'];

p.packSizes = {
  '3/4': 200,
  '1': 100,
  '1 1/4': 60,
  '1 1/2': 40,
  '2': 16
};

p.sizeProductCodes = {
  '3/4': 'FG-400403',
  '1': 'FG-400404',
  '1 1/4': 'FG-400477',
  '1 1/2': 'FG-401661',
  '2': 'FG-400479'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Updated product:', p.name);
console.log('Sizes:', p.sizes);
console.log('PackSizes:', JSON.stringify(p.packSizes, null, 2));
console.log('SizeProductCodes:', JSON.stringify(p.sizeProductCodes, null, 2));
