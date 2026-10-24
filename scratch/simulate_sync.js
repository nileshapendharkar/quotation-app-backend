const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = 'C:/Users/sapga/Downloads/Products_Master_2026-10-21 (2).xlsx';
const wb = xlsx.readFile(excelPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

const currentDb = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/db_data.json'), 'utf8'));

// 1. Group Excel rows by Product Name
const excelGroups = new Map();

rows.forEach((r, idx) => {
  const code = (r['Product Code'] || '').toString().trim();
  const name = (r['Product Name'] || '').toString().trim();
  let size = (r['Sizes'] !== undefined && r['Sizes'] !== null) ? r['Sizes'].toString().trim() : '';
  const uom = (r['UOM'] || '').toString().trim();
  let packing = (r['Packing'] !== undefined && r['Packing'] !== null) ? r['Packing'].toString().trim() : '';

  if (!name) return;

  if (!excelGroups.has(name)) {
    excelGroups.set(name, {
      name,
      uom: uom || 'NOS',
      variants: []
    });
  }

  const group = excelGroups.get(name);
  if (uom && (!group.uom || group.uom === 'NOS' || group.uom === 'Nos')) {
    group.uom = uom;
  }

  group.variants.push({
    code,
    size: size === '-' ? '' : size,
    packing,
    uom
  });
});

console.log('Total Excel product groups (unique names):', excelGroups.size);

// Build code-to-db-product map
const codeToDbProduct = new Map();
currentDb.products.forEach(p => {
  if (p.code) codeToDbProduct.set(p.code.trim().toUpperCase(), p);
  if (p.sizeProductCodes) {
    Object.values(p.sizeProductCodes).forEach(cd => {
      if (cd) codeToDbProduct.set(cd.toString().trim().toUpperCase(), p);
    });
  }
});

// Build name-to-db-product map
const nameToDbProduct = new Map();
currentDb.products.forEach(p => {
  nameToDbProduct.set(p.name.trim().toUpperCase(), p);
});

const matchedDbProducts = new Set();
const finalProducts = [];
let brandNewCount = 0;
let updatedCount = 0;

excelGroups.forEach((group, prodName) => {
  // Try matching by code from any of its variants
  let existingDbProduct = null;
  for (const v of group.variants) {
    if (v.code && codeToDbProduct.has(v.code.toUpperCase())) {
      existingDbProduct = codeToDbProduct.get(v.code.toUpperCase());
      break;
    }
  }

  // If not matched by code, try matching by name
  if (!existingDbProduct && nameToDbProduct.has(prodName.toUpperCase())) {
    existingDbProduct = nameToDbProduct.get(prodName.toUpperCase());
  }

  // Determine sizes, sizeProductCodes, packSizes
  const sizes = [];
  const sizeProductCodes = {};
  const packSizes = {};
  let singleCode = '';
  let singlePacking = '';

  const hasVariants = group.variants.some(v => v.size);

  if (hasVariants) {
    group.variants.forEach(v => {
      const sz = v.size || 'Standard';
      if (!sizes.includes(sz)) sizes.push(sz);
      if (v.code) sizeProductCodes[sz] = v.code;
      if (v.packing !== '') packSizes[sz] = isNaN(Number(v.packing)) ? v.packing : Number(v.packing);
    });
  } else {
    // Single item without sizes
    const first = group.variants[0];
    singleCode = first.code || '';
    singlePacking = first.packing || '';
  }

  let productObj = null;

  if (existingDbProduct) {
    matchedDbProducts.add(existingDbProduct.id);
    updatedCount++;

    productObj = {
      ...existingDbProduct,
      name: prodName,
      uom: group.uom || existingDbProduct.uom || 'Nos',
      sizes: sizes,
      sizeProductCodes: Object.keys(sizeProductCodes).length > 0 ? sizeProductCodes : {},
      packSizes: Object.keys(packSizes).length > 0 ? packSizes : {},
      status: 'Active'
    };

    if (!hasVariants) {
      productObj.code = singleCode || productObj.code;
      productObj.packing = singlePacking !== '' ? singlePacking : (productObj.packing || '-');
    } else {
      delete productObj.code; // or keep it
    }
  } else {
    // Brand new product
    brandNewCount++;
    console.log('Brand new product in Excel:', prodName);
    const newId = 'prod_new_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    productObj = {
      id: newId,
      name: prodName,
      uom: group.uom || 'Nos',
      categoryId: 'cat_agri', // fallback or auto-detected
      categoryName: 'Agriculture Pipes & Fittings',
      subcategoryId: null,
      image: '/images/default-product.png',
      description: `${prodName}.`,
      status: 'Active',
      sizes: sizes,
      sizeProductCodes: sizeProductCodes,
      packSizes: packSizes,
      ...(hasVariants ? {} : { code: singleCode, packing: singlePacking || '-' })
    };
  }

  finalProducts.push(productObj);
});

console.log('Final Products count from Excel:', finalProducts.length);
console.log('Matched existing products:', updatedCount);
console.log('Brand new products created:', brandNewCount);

const toDelete = currentDb.products.filter(p => !matchedDbProducts.has(p.id));
console.log('Existing DB products to be deleted count:', toDelete.length);
console.log('Products to be deleted:', toDelete.map(p => ({ id: p.id, name: p.name, category: p.categoryName })));
