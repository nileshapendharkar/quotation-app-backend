const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const uomMapping = {
  'cat_agri': 'BOX',
  'cat_hdpe': 'MTR',
  'cat_drip': 'MTR'
};

// Update categories
let catCount = 0;
data.categories.forEach(c => {
  if (uomMapping[c.id]) {
    c.uom = uomMapping[c.id];
    catCount++;
  }
});

// Update products
let prodCount = 0;
data.products.forEach(p => {
  const targetUom = uomMapping[p.categoryId];
  if (targetUom) {
    p.uom = targetUom;
    prodCount++;
  }
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log(`✅ Updated UOM for ${catCount} categories and ${prodCount} products.`);
