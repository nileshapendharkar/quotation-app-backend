const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db_data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const prod1 = {
  id: 'prod_dwc_1',
  name: 'DWC PIPE SN4',
  categoryId: 'cat_dwc',
  categoryName: 'DWC',
  image: '/images/categories/cat_dwc.png',
  description: 'DWC PIPE SN4 for underground cable protection and drainage systems.',
  sizes: [],
  status: 'Active',
  uom: 'MTR'
};

const prod2 = {
  id: 'prod_dwc_2',
  name: 'DWC PIPE SN8',
  categoryId: 'cat_dwc',
  categoryName: 'DWC',
  image: '/images/categories/cat_dwc.png',
  description: 'DWC PIPE SN8 for underground cable protection and drainage systems.',
  sizes: [],
  status: 'Active',
  uom: 'MTR'
};

// Check if they already exist
let p1 = data.products.find(p => p.id === 'prod_dwc_1' || p.name === 'DWC PIPE SN4');
if (!p1) {
  data.products.push(prod1);
  console.log('Added prod_dwc_1: DWC PIPE SN4');
} else {
  Object.assign(p1, prod1);
  console.log('Updated prod_dwc_1: DWC PIPE SN4');
}

let p2 = data.products.find(p => p.id === 'prod_dwc_2' || p.name === 'DWC PIPE SN8');
if (!p2) {
  data.products.push(prod2);
  console.log('Added prod_dwc_2: DWC PIPE SN8');
} else {
  Object.assign(p2, prod2);
  console.log('Updated prod_dwc_2: DWC PIPE SN8');
}

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log('✅ Successfully updated db_data.json with DWC products');
