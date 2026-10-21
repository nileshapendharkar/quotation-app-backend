const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const EXCEL_FILE = 'C:/Users/sapga/Downloads/Products_Master_2026-10-21 (2).xlsx';
const DB_FILE = path.join(__dirname, '../database/db_data.json');
const BACKUP_FILE = path.join(__dirname, `../database/backup_db_data_${Date.now()}.json`);

async function syncProducts() {
  console.log('====================================================');
  console.log('🚀 STARTING PRODUCT MASTER CATALOG SYNC');
  console.log('Source Excel:', EXCEL_FILE);
  console.log('====================================================\n');

  // 1. Read existing local database
  if (!fs.existsSync(DB_FILE)) {
    throw new Error(`Database file not found at ${DB_FILE}`);
  }
  const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  console.log(`📦 Loaded local db_data.json: ${dbData.products.length} existing products.`);

  // 2. Create local backup
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(dbData, null, 2));
  console.log(`💾 Backup created successfully at: ${BACKUP_FILE}\n`);

  // 3. Read Excel workbook
  if (!fs.existsSync(EXCEL_FILE)) {
    throw new Error(`Excel file not found at ${EXCEL_FILE}`);
  }
  const wb = xlsx.readFile(EXCEL_FILE);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);
  console.log(`📊 Read Excel sheet "${wb.SheetNames[0]}": ${rows.length} rows.`);

  // 4. Group Excel rows by Product Name
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
        uom: uom || 'Nos',
        variants: []
      });
    }

    const group = excelGroups.get(name);
    if (uom && (!group.uom || group.uom === 'Nos' || group.uom === 'NOS')) {
      group.uom = uom;
    }

    group.variants.push({
      code,
      size: size === '-' ? '' : size,
      packing,
      uom,
      rowNumber: idx + 2
    });
  });

  console.log(`🔍 Grouped into ${excelGroups.size} unique products.\n`);

  // 5. Index existing DB products
  const dbByName = new Map();
  dbData.products.forEach(p => {
    dbByName.set(p.name.trim().toLowerCase(), p);
  });

  // Explicit mappings for renamed products
  const explicitRenameMap = {
    '3M 10KG PVC PIPE ISI': 'prod_agri_3',
    '3M 10KG PVC PIPE': 'prod_agri_4'
  };

  const dbById = new Map();
  dbData.products.forEach(p => dbById.set(p.id, p));

  const matchedProductIds = new Set();
  const updatedProducts = [];
  let updatedExistingCount = 0;
  let newCreatedCount = 0;

  excelGroups.forEach((group, prodName) => {
    let existingProd = null;

    // Check explicit rename map
    if (explicitRenameMap[prodName] && dbById.has(explicitRenameMap[prodName])) {
      existingProd = dbById.get(explicitRenameMap[prodName]);
    }

    // Check exact name match
    if (!existingProd && dbByName.has(prodName.trim().toLowerCase())) {
      existingProd = dbByName.get(prodName.trim().toLowerCase());
    }

    // Collect sizes, sizeProductCodes, packSizes, and packing string
    const sizes = [];
    const sizeProductCodes = {};
    const packSizes = {};
    const packingPairs = [];
    let singleCode = '';
    let singlePacking = '';

    const hasVariants = group.variants.some(v => v.size);

    if (hasVariants) {
      group.variants.forEach(v => {
        const sz = v.size || 'Standard';
        if (!sizes.includes(sz)) sizes.push(sz);
        if (v.code) sizeProductCodes[sz] = v.code;
        if (v.packing !== '') {
          const packVal = isNaN(Number(v.packing)) ? v.packing : Number(v.packing);
          packSizes[sz] = packVal;
          packingPairs.push(`${sz}:${packVal}`);
        }
      });
    } else {
      const first = group.variants[0];
      singleCode = first.code || '';
      singlePacking = first.packing || '';
    }

    const formattedPacking = packingPairs.length > 0 
      ? packingPairs.join(', ') 
      : (singlePacking || '-');

    if (existingProd) {
      matchedProductIds.add(existingProd.id);
      updatedExistingCount++;

      const updated = {
        ...existingProd,
        name: prodName,
        uom: group.uom || existingProd.uom || 'Nos',
        sizes: sizes,
        sizeProductCodes: Object.keys(sizeProductCodes).length > 0 ? sizeProductCodes : {},
        packSizes: Object.keys(packSizes).length > 0 ? packSizes : {},
        packing: formattedPacking,
        status: 'Active'
      };

      if (!hasVariants) {
        if (singleCode) updated.code = singleCode;
        updated.packing = singlePacking || '-';
      }

      updatedProducts.push(updated);
    } else {
      // New product (e.g. AGRI TEE PN4)
      newCreatedCount++;
      const newId = 'prod_agri_tee_pn4_' + Date.now();
      console.log(`➕ Creating new product: "${prodName}"`);

      const newProduct = {
        id: newId,
        name: prodName,
        uom: group.uom || 'Nos',
        categoryId: 'cat_agri',
        categoryName: 'Agriculture Pipes & Fittings',
        subcategoryId: null,
        image: '/images/agri/AGRI TEE PN6.webp', // appropriate image from family
        description: `${prodName}. Available sizes: ${sizes.join(', ')}.`,
        details: `${prodName} manufactured by Ganesh Gouri Industries.`,
        specification: '',
        status: 'Active',
        sizes: sizes,
        sizeProductCodes: sizeProductCodes,
        packSizes: packSizes,
        packing: formattedPacking
      };

      if (!hasVariants) {
        newProduct.code = singleCode;
        newProduct.packing = singlePacking || '-';
      }

      matchedProductIds.add(newId);
      updatedProducts.push(newProduct);
    }
  });

  // 6. Identify products to delete
  const deletedProducts = dbData.products.filter(p => !matchedProductIds.has(p.id));
  console.log(`\n🗑️ Products to DELETE (not in Excel master catalog): ${deletedProducts.length}`);
  deletedProducts.forEach(p => {
    console.log(`   - [${p.id}] ${p.name} (${p.categoryName || 'No Cat'})`);
  });

  // 7. Update database object
  dbData.products = updatedProducts;

  // 8. Write to local db_data.json
  fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
  console.log(`\n✅ Successfully updated local ${DB_FILE}`);

  // 9. Write to Neon PostgreSQL database
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('⚠️ No DATABASE_URL in .env, skipping Neon update.');
  } else {
    console.log('🔄 Syncing changes to Neon PostgreSQL cloud database...');
    const sql = neon(connectionString);
    const dataJson = JSON.stringify(dbData);
    await sql`
      INSERT INTO app_state (key, data, updated_at)
      VALUES ('appdata', ${dataJson}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `;
    console.log('✅ Successfully synced all products to Neon PostgreSQL database!');
  }

  // 10. Verify Neon DB
  if (connectionString) {
    const sql = neon(connectionString);
    const check = await sql`
      SELECT 
        jsonb_array_length(data->'products') as total_products, 
        updated_at 
      FROM app_state 
      WHERE key = 'appdata'
    `;
    console.log(`\n🎉 Verification Complete: Total Products in Cloud Neon DB: ${check[0].total_products}`);
  }

  console.log(`\nSummary:`);
  console.log(`- Total products in master catalog: ${updatedProducts.length}`);
  console.log(`- Existing products updated: ${updatedExistingCount}`);
  console.log(`- New products created: ${newCreatedCount}`);
  console.log(`- Obsolete products removed: ${deletedProducts.length}`);
}

syncProducts().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
