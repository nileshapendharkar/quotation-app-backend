const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_dwc_1');
if (!p) {
  console.error('Product prod_dwc_1 not found!');
  process.exit(1);
}

p.name = 'DWC PIPE SN4';
p.sizes = [
  '150MM',
  '200MM',
  '250MM',
  '300MM',
  '400MM',
  '500MM'
];
p.description = `DWC PIPE SN4 for underground cable protection and drainage systems. Available sizes: ${p.sizes.join(', ')}.`;

p.packSizes = {};
p.packings = {};
p.sizes.forEach(s => {
  p.packSizes[s] = 1;
  p.packings[s] = 1;
});

p.sizeProductCodes = {
  '150MM': 'FG-401854',
  '200MM': 'FG-401855',
  '250MM': 'FG-401856',
  '300MM': 'FG-401857',
  '400MM': 'FG-401858',
  '500MM': 'FG-401859'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Successfully updated prod_dwc_1:', JSON.stringify(p, null, 2));
