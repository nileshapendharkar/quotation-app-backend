const fs = require('fs');
const path = require('path');

const targetCodes = [
  "FG-400739", "FG-400771", "FG-400746", "FG-400726", "FG-400753", "FG-400747",
  "FG-400790", "FG-400788", "FG-400791", "FG-401484", "FG-401485", "FG-400724",
  "FG-401724", "FG-400772", "FG-400756", "FG-400786", "FG-400781", "FG-400762",
  "FG-400800", "FG-400778", "FG-400723", "FG-400777", "FG-400801", "FG-400744",
  "FG-400792", "FG-400774", "FG-400785", "FG-400802", "FG-400803", "FG-400820",
  "FG-401816", "FG-400758", "FG-401648", "FG-400811", "FG-400741", "FG-400751",
  "FG-400752", "FG-400738", "FG-400749", "FG-400750", "FG-400735", "FG-400736",
  "FG-400817", "FG-400815", "FG-400740", "FG-400818", "FG-400816", "FG-400754",
  "FG-400766"
];

const targetSet = new Set(targetCodes.map(c => c.trim().toUpperCase()));

const dbDataPath = path.join(__dirname, '../database/db_data.json');
const exportDataPath = path.join(__dirname, './catalog_export_data.json');

console.log(`Targeting ${targetSet.size} Product Codes for UOM -> BOX update...`);

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
      console.log(`[db_data.json] Updating UOM to BOX for product: ${prod.id} (${prod.name}) [Old UOM: ${prod.uom}]`);
      prod.uom = "BOX";
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
      console.log(`[catalog_export_data.json] Updating UOM to BOX for Code ${code}: ${row["Product Name"]} [Old UOM: ${row["UOM"]}]`);
      row["UOM"] = "BOX";
      exportUpdatedCount++;
    }
  });
}

fs.writeFileSync(exportDataPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log(`Successfully updated ${exportUpdatedCount} items in catalog_export_data.json.`);
console.log("All UOM -> BOX updates completed successfully!");
