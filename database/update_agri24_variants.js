const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_agri_24');
if (!p) {
  console.error('Product prod_agri_24 not found!');
  process.exit(1);
}

p.name = 'AGRI REDUCING BUSH 10KG';
p.sizes = [
  '32 X 20MM',
  '32 X 25MM'
];
p.description = `AGRI REDUCING BUSH 10KG. Available sizes: ${p.sizes.join(', ')}.`;

p.packSizes = {
  '32 X 20MM': 250,
  '32 X 25MM': 250
};

p.packings = {
  '32 X 20MM': 250,
  '32 X 25MM': 250
};

p.sizeProductCodes = {
  '32 X 20MM': 'FG-400673',
  '32 X 25MM': 'FG-400674'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Successfully updated prod_agri_24:', JSON.stringify(p, null, 2));
