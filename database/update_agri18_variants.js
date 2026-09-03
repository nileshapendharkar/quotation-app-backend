const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_agri_18');
if (!p) {
  console.error('Product prod_agri_18 not found!');
  process.exit(1);
}

p.name = 'AGRI UNION 10KG';
p.sizes = [
  '25MM',
  '32MM'
];
p.description = `AGRI UNION 10KG. Available sizes: ${p.sizes.join(', ')}.`;

p.packSizes = {
  '25MM': 180,
  '32MM': 100
};

p.packings = {
  '25MM': 180,
  '32MM': 100
};

p.sizeProductCodes = {
  '25MM': 'FG-400679',
  '32MM': 'FG-400680'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Successfully updated prod_agri_18:', JSON.stringify(p, null, 2));
