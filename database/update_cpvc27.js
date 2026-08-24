const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_cpvc_27');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.name = 'CPVC REDUCER FTA HEXA BRASS';
p.description = 'CPVC REDUCER FTA HEXA BRASS. Available sizes: 3/4 X 1/2.';

p.packSizes = {
  '3/4 X 1/2': 240
};

p.sizeProductCodes = {
  '3/4 X 1/2': 'FG-400514'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Updated product:', p.name);
console.log('Sizes:', p.sizes);
console.log('PackSizes:', JSON.stringify(p.packSizes, null, 2));
console.log('SizeProductCodes:', JSON.stringify(p.sizeProductCodes, null, 2));
