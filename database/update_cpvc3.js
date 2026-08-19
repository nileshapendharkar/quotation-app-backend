const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_cpvc_3');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.name = 'CPVC PIPES (SCH-80)';
p.description = 'CPVC PIPES (SCH-80). Available in 3MTR and 5MTR lengths. Sizes: 2 1/2", 3", 4".';

p.sizes = [
  '2 1/2" - 3MTR', '2 1/2" - 5MTR',
  '3" - 3MTR',     '3" - 5MTR',
  '4" - 3MTR',     '4" - 5MTR'
];

p.packSizes = {
  '2 1/2" - 3MTR': 5,
  '2 1/2" - 5MTR': 5,
  '3" - 3MTR': 4,
  '3" - 5MTR': 4,
  '4" - 3MTR': 2,
  '4" - 5MTR': 2
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Updated product:', p.name);
console.log('Sizes:', p.sizes);
console.log('PackSizes:', JSON.stringify(p.packSizes, null, 2));
