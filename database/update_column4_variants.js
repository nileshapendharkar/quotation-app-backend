const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const p = data.products.find(p => p.id === 'prod_column_4');
if (!p) {
  console.error('Product prod_column_4 not found!');
  process.exit(1);
}

p.name = 'COLOUMN PIPE STANDARD PLUS';
p.sizes = [
  '60MM 2 Inch 25KG COUPLER TYPE'
];
p.description = `COLOUMN PIPE STANDARD PLUS. Available sizes: ${p.sizes.join(', ')}.`;

p.packSizes = {
  '60MM 2 Inch 25KG COUPLER TYPE': 12
};

p.packings = {
  '60MM 2 Inch 25KG COUPLER TYPE': 12
};

p.sizeProductCodes = {
  '60MM 2 Inch 25KG COUPLER TYPE': 'FG-401173'
};

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Successfully updated prod_column_4:', JSON.stringify(p, null, 2));
