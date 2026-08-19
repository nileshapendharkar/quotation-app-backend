const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_cpvc_1');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.sizeProductCodes = {
  '1/2" - 3MTR': 'FG-400921',
  '1/2" - 5MTR': 'FG-400927',
  '3/4" - 3MTR': 'FG-400922',
  '3/4" - 5MTR': 'FG-400928',
  '1" - 3MTR':   'FG-400923',
  '1" - 5MTR':   'FG-400929',
  '1 1/4" - 3MTR': 'FG-400924',
  '1 1/4" - 5MTR': 'FG-400930',
  '1 1/2" - 3MTR': 'FG-400925',
  '1 1/2" - 5MTR': 'FG-400931',
  '2" - 3MTR':   'FG-400926',
  '2" - 5MTR':   'FG-400932'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ sizeProductCodes updated for:', p.name);
console.log(JSON.stringify(p.sizeProductCodes, null, 2));
