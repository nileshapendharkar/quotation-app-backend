const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_cpvc_4');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.sizeProductCodes = {
  '2 1/2" - 3MTR': 'FG-400933',
  '2 1/2" - 5MTR': 'FG-400936',
  '3" - 3MTR':     'FG-400934',
  '3" - 5MTR':     'FG-400937',
  '4" - 3MTR':     'FG-400935',
  '4" - 5MTR':     'FG-400938'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ sizeProductCodes updated for:', p.name);
console.log(JSON.stringify(p.sizeProductCodes, null, 2));
