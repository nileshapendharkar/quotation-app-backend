const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_agri_11');
if (!p) {
  console.error('Product prod_agri_11 not found!');
  process.exit(1);
}

p.name = 'AGRI END CAP THREADED';
p.sizes = [
  '63MM 6KG',
  '75MM 6KG',
  '90MM 6KG',
  '110MM 6KG'
];
p.description = `AGRI END CAP THREADED. Available sizes: ${p.sizes.join(', ')}.`;

p.packSizes = {
  '63MM 6KG': 60,
  '75MM 6KG': 80,
  '90MM 6KG': 54,
  '110MM 6KG': 48
};

p.packings = {
  '63MM 6KG': 60,
  '75MM 6KG': 80,
  '90MM 6KG': 54,
  '110MM 6KG': 48
};

p.sizeProductCodes = {
  '63MM 6KG': 'FG-400635',
  '75MM 6KG': 'FG-400636',
  '90MM 6KG': 'FG-400637',
  '110MM 6KG': 'FG-400638'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Successfully updated prod_agri_11:', JSON.stringify(p, null, 2));
