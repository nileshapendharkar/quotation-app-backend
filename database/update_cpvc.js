const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_cpvc_1');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.name = 'CPVC PIPES (SDR 13.5)';
p.description = 'CPVC PIPES (SDR 13.5) ISI. Available in 3MTR and 5MTR lengths. Sizes: 1/2", 3/4", 1", 1 1/4", 1 1/2", 2".';

p.sizes = [
  '1/2" - 3MTR', '1/2" - 5MTR',
  '3/4" - 3MTR', '3/4" - 5MTR',
  '1" - 3MTR',   '1" - 5MTR',
  '1 1/4" - 3MTR','1 1/4" - 5MTR',
  '1 1/2" - 3MTR','1 1/2" - 5MTR',
  '2" - 3MTR',   '2" - 5MTR'
];

p.packSizes = {
  '1/2" - 3MTR': 50, '1/2" - 5MTR': 50,
  '3/4" - 3MTR': 50, '3/4" - 5MTR': 50,
  '1" - 3MTR': 25,   '1" - 5MTR': 25,
  '1 1/4" - 3MTR': 20,'1 1/4" - 5MTR': 20,
  '1 1/2" - 3MTR': 10,'1 1/2" - 5MTR': 10,
  '2" - 3MTR': 10,   '2" - 5MTR': 10
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Updated product:', p.name);
console.log('Sizes:', p.sizes);
console.log('PackSizes:', JSON.stringify(p.packSizes, null, 2));
