const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_column_4');
if (!p) {
  console.error('Product prod_column_4 not found!');
  process.exit(1);
}

p.name = 'COLOUMN PIPE COUPLER STANDARD PLUS';
p.sizes = [
  '2 25KG'
];
p.description = `COLOUMN PIPE COUPLER STANDARD PLUS. Available sizes: ${p.sizes.join(', ')}.`;

p.packSizes = {
  '2 25KG': 12
};

p.packings = {
  '2 25KG': 12
};

p.sizeProductCodes = {
  '2 25KG': 'FG-401173'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Successfully updated prod_column_4:', JSON.stringify(p, null, 2));
