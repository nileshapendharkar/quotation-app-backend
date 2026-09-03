const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_eco_1');
if (!p) {
  console.error('Product prod_eco_1 not found!');
  process.exit(1);
}

p.name = 'ECO DRAINAGE PIPES SELFIT';
p.sizes = [
  '110MM 3M LIGHT',
  '160MM 3M LIGHT',
  '200MM 3M LIGHT',
  '110MM 6M LIGHT',
  '160MM 6M LIGHT',
  '200MM 6M LIGHT',
  '110MM 3M HEAVY',
  '160MM 3M HEAVY',
  '200MM 3M HEAVY',
  '110MM 6M HEAVY',
  '160MM 6M HEAVY',
  '200MM 6M HEAVY',
  '250MM 6M',
  '250MM 3M LIGHT'
];
p.description = `ECO DRAINAGE PIPES SELFIT. Available sizes: ${p.sizes.join(', ')}.`;

p.packSizes = {};
p.packings = {};
p.sizes.forEach(s => {
  p.packSizes[s] = 1;
  p.packings[s] = 1;
});

p.sizeProductCodes = {
  '110MM 3M LIGHT': 'FG-401469',
  '160MM 3M LIGHT': 'FG-401470',
  '200MM 3M LIGHT': 'FG-401471',
  '110MM 6M LIGHT': 'FG-401472',
  '160MM 6M LIGHT': 'FG-401473',
  '200MM 6M LIGHT': 'FG-401474',
  '110MM 3M HEAVY': 'FG-401475',
  '160MM 3M HEAVY': 'FG-401476',
  '200MM 3M HEAVY': 'FG-401477',
  '110MM 6M HEAVY': 'FG-401478',
  '160MM 6M HEAVY': 'FG-401479',
  '200MM 6M HEAVY': 'FG-401480',
  '250MM 6M': 'FG-401486',
  '250MM 3M LIGHT': 'FG-401487'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Successfully updated prod_eco_1:', JSON.stringify(p, null, 2));
