const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_cpvc_9');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.name = 'CPVC MTA';
p.description = 'CPVC MTA. Available sizes: 3/4, 1, 1 1/4, 1 1/2, 2.';

p.sizes = ['3/4', '1', '1 1/4', '1 1/2', '2'];

p.packSizes = {
  '3/4': 270,
  '1': 200,
  '1 1/4': 100,
  '1 1/2': 80,
  '2': 30
};

p.sizeProductCodes = {
  '3/4': 'FG-400420',
  '1': 'FG-400421',
  '1 1/4': 'FG-400422',
  '1 1/2': 'FG-400500',
  '2': 'FG-400501'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Updated product:', p.name);
console.log('Sizes:', p.sizes);
console.log('PackSizes:', JSON.stringify(p.packSizes, null, 2));
console.log('SizeProductCodes:', JSON.stringify(p.sizeProductCodes, null, 2));
