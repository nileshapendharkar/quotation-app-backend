const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_eco_2');
if (!p) {
  console.error('Product prod_eco_2 not found!');
  process.exit(1);
}

p.name = 'ECO DRAINAGE PIPES RINGFIT';
p.sizes = [
  '110MM 3M HEAVY',
  '160MM 3M LIGHT',
  '110MM 3M LIGHT'
];
p.description = `ECO DRAINAGE PIPES RINGFIT. Available sizes: ${p.sizes.join(', ')}.`;

p.packSizes = {
  '110MM 3M HEAVY': 1,
  '160MM 3M LIGHT': 1,
  '110MM 3M LIGHT': 1
};

p.packings = {
  '110MM 3M HEAVY': 1,
  '160MM 3M LIGHT': 1,
  '110MM 3M LIGHT': 1
};

p.sizeProductCodes = {
  '110MM 3M HEAVY': 'FG-401481',
  '160MM 3M LIGHT': 'FG-401482',
  '110MM 3M LIGHT': 'FG-401483'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Successfully updated prod_eco_2:', JSON.stringify(p, null, 2));
