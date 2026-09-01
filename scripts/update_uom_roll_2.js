const fs = require('fs');
const path = require('path');

const targetCodes = [
  "FG-401339", "FG-401795", "FG-400845", "FG-401335"
];

const targetSet = new Set(targetCodes.map(c => c.trim().toUpperCase()));

const dbDataPath = path.join(__dirname, '../database/db_data.json');
const exportDataPath = path.join(__dirname, './catalog_export_data.json');

console.log(`Targeting ${targetSet.size} Product Codes for UOM -> ROLL update...`);

// 1. Update db_data.json
const dbData = JSON.parse(fs.readFileSync(dbDataPath, 'utf8'));
let dbUpdatedCount = 0;

if (dbData.products && Array.isArray(dbData.products)) {
  dbData.products.forEach(prod => {
    let hasTarget = false;
    if (prod.sizeProductCodes) {
      Object.values(prod.sizeProductCodes).forEach(code => {
        if (targetSet.has(String(code).trim().toUpperCase())) {
          hasTarget = true;
        }
      });
    }
    if (prod.code && targetSet.has(String(prod.code).trim().toUpperCase())) hasTarget = true;
    if (prod.productCode && targetSet.has(String(prod.productCode).trim().toUpperCase())) hasTarget = true;

    if (hasTarget) {
      console.log(`[db_data.json] Updating UOM to ROLL for product: ${prod.id} (${prod.name}) [Old UOM: ${prod.uom}]`);
      prod.uom = "ROLL";
      dbUpdatedCount++;
    }
  });
}

fs.writeFileSync(dbDataPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log(`Successfully updated ${dbUpdatedCount} base products in db_data.json.`);

// 2. Update catalog_export_data.json
const exportData = JSON.parse(fs.readFileSync(exportDataPath, 'utf8'));
let exportUpdatedCount = 0;

if (Array.isArray(exportData)) {
  exportData.forEach(row => {
    const code = row["Product Code"] ? String(row["Product Code"]).trim().toUpperCase() : '';
    if (targetSet.has(code)) {
      console.log(`[catalog_export_data.json] Updating UOM to ROLL for Code ${code}: ${row["Product Name"]} [Old UOM: ${row["UOM"]}]`);
      row["UOM"] = "ROLL";
      exportUpdatedCount++;
    }
  });
}

fs.writeFileSync(exportDataPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log(`Successfully updated ${exportUpdatedCount} items in catalog_export_data.json.`);
console.log("All UOM -> ROLL updates completed successfully!");
