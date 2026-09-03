const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_agri_17');
if (!p) {
  console.error('Product prod_agri_17 not found!');
  process.exit(1);
}

p.name = 'AGRI ELBOW 10KG';
p.sizes = [
  '25MM',
  '32MM'
];
p.description = `AGRI ELBOW 10KG. Available sizes: ${p.sizes.join(', ')}.`;

p.packSizes = {
  '25MM': 300,
  '32MM': 150
};

p.packings = {
  '25MM': 300,
  '32MM': 150
};

p.sizeProductCodes = {
  '25MM': 'FG-400665',
  '32MM': 'FG-400666'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Successfully updated prod_agri_17:', JSON.stringify(p, null, 2));
