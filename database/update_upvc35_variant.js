const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_upvc_35');
if (!p) {
  console.error('Product prod_upvc_35 not found!');
  process.exit(1);
}

p.name = 'UPVC CIRCUIT PLUG';
p.sizes = ['1/2'];
p.description = `UPVC CIRCUIT PLUG. Available sizes: ${p.sizes.join(', ')}.`;

p.packSizes = {
  '1/2': 300
};

p.packings = {
  '1/2': 300
};

p.sizeProductCodes = {
  '1/2': 'FG-400402'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Successfully updated prod_upvc_35:', JSON.stringify(p, null, 2));
