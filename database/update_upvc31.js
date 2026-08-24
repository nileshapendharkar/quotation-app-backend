const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_upvc_31');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.name = 'UPVC NVR';

p.sizes = [
  '1/2',
  '3/4',
  '1'
];

p.description = `UPVC NVR. Available sizes: ${p.sizes.join(', ')}.`;

p.packSizes = {
  '1/2': 24,
  '3/4': 24,
  '1': 24
};

p.sizeProductCodes = {
  '1/2': 'FG-400366',
  '3/4': 'FG-400367',
  '1': 'FG-400368'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Updated product:', p.name);
console.log('Sizes:', p.sizes);
console.log('PackSizes:', JSON.stringify(p.packSizes, null, 2));
console.log('SizeProductCodes:', JSON.stringify(p.sizeProductCodes, null, 2));
