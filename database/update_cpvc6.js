const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_cpvc_6');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.name = 'CPVC END CAP';
p.description = 'CPVC END CAP. Available sizes: 3/4, 1, 1 1/4, 1 1/2, 2.';

p.sizes = ['3/4', '1', '1 1/4', '1 1/2', '2'];

p.packSizes = {
  '3/4': 600,
  '1': 320,
  '1 1/4': 160,
  '1 1/2': 100,
  '2': 40
};

p.sizeProductCodes = {
  '3/4': 'FG-400426',
  '1': 'FG-400427',
  '1 1/4': 'FG-400428',
  '1 1/2': 'FG-401700',
  '2': 'FG-400504'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Updated product:', p.name);
console.log('Sizes:', p.sizes);
console.log('PackSizes:', JSON.stringify(p.packSizes, null, 2));
console.log('SizeProductCodes:', JSON.stringify(p.sizeProductCodes, null, 2));
