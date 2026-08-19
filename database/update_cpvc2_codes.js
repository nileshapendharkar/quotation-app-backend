const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_cpvc_2');
if (!p) { console.error('Product not found!'); process.exit(1); }

p.sizeProductCodes = {
  '1/2" - 3MTR': 'FG-400909',
  '1/2" - 5MTR': 'FG-400915',
  '3/4" - 3MTR': 'FG-400910',
  '3/4" - 5MTR': 'FG-400916',
  '1" - 3MTR':   'FG-400911',
  '1" - 5MTR':   'FG-400917',
  '1 1/4" - 3MTR': 'FG-400912',
  '1 1/4" - 5MTR': 'FG-400918',
  '1 1/2" - 3MTR': 'FG-400913',
  '1 1/2" - 5MTR': 'FG-400919',
  '2" - 3MTR':   'FG-400914',
  '2" - 5MTR':   'FG-400920'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ sizeProductCodes updated for:', p.name);
console.log(JSON.stringify(p.sizeProductCodes, null, 2));
