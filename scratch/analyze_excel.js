const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = 'C:/Users/sapga/Downloads/Products_Master_2026-10-21 (2).xlsx';
const wb = xlsx.readFile(excelPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

console.log('Total rows in Excel:', rows.length);

// Group by Product Name
const productsByName = new Map();
const allProductCodesInExcel = new Set();

rows.forEach((r, idx) => {
  const code = (r['Product Code'] || '').toString().trim();
  const name = (r['Product Name'] || '').toString().trim();
  const size = (r['Sizes'] !== undefined && r['Sizes'] !== null) ? r['Sizes'].toString().trim() : '';
  const uom = (r['UOM'] || '').toString().trim();
  const packing = (r['Packing'] !== undefined && r['Packing'] !== null) ? r['Packing'].toString().trim() : '';

  if (code) allProductCodesInExcel.add(code);

  if (!productsByName.has(name)) {
    productsByName.set(name, {
      name,
      uom: uom || 'NOS',
      variants: []
    });
  }

  const p = productsByName.get(name);
  if (uom && (!p.uom || p.uom === 'NOS')) {
    p.uom = uom;
  }
  p.variants.push({ code, size, packing, uom, rawRow: idx + 2 });
});

console.log('Distinct Product Names in Excel:', productsByName.size);
console.log('Distinct Product Codes in Excel:', allProductCodesInExcel.size);

// Read current db_data.json
const currentDb = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/db_data.json'), 'utf8'));
console.log('Current DB products count:', currentDb.products.length);

// Check overlap
let existingMatchedByName = 0;
let existingMatchedByCode = 0;

currentDb.products.forEach(p => {
  if (productsByName.has(p.name)) {
    existingMatchedByName++;
  }
  // check if any of its codes match
  let hasCodeMatch = false;
  if (p.code && allProductCodesInExcel.has(p.code)) hasCodeMatch = true;
  if (p.sizeProductCodes) {
    Object.values(p.sizeProductCodes).forEach(cd => {
      if (allProductCodesInExcel.has(cd)) hasCodeMatch = true;
    });
  }
  if (hasCodeMatch) existingMatchedByCode++;
});

console.log('Current DB products matching Excel by Name:', existingMatchedByName);
console.log('Current DB products matching Excel by Code:', existingMatchedByCode);

// Print some product names from Excel
const namesSample = Array.from(productsByName.keys()).slice(0, 15);
console.log('Sample Excel Product Names:', namesSample);

// Show products in DB that would be deleted (not in Excel)
const dbProductsNotInExcel = currentDb.products.filter(p => !productsByName.has(p.name));
console.log('DB products that would be deleted count:', dbProductsNotInExcel.length);
console.log('Sample DB products to be deleted:', dbProductsNotInExcel.slice(0, 10).map(p => ({ id: p.id, name: p.name, categoryName: p.categoryName })));

// Show products in Excel that are NOT in DB
const excelProductsNotInDb = Array.from(productsByName.keys()).filter(name => !currentDb.products.some(p => p.name.trim().toLowerCase() === name.trim().toLowerCase()));
console.log('Excel products that are NEW (not in current DB):', excelProductsNotInDb.length);
console.log('Sample new Excel products:', excelProductsNotInDb.slice(0, 10));
