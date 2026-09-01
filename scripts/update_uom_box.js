const fs = require('fs');
const path = require('path');

const targetCodes = [
  "FG-400779", "FG-400732", "FG-400768", "FG-400731", "FG-400773", "FG-400787",
  "FG-400769", "FG-400784", "FG-400757", "FG-400794", "FG-400789", "FG-400700",
  "FG-400819", "FG-400770", "FG-400699", "FG-400776", "FG-400805", "FG-400729",
  "FG-400759", "FG-400783", "FG-400765", "FG-400767", "FG-401831", "FG-400780",
  "FG-400743", "FG-400775", "FG-400761"
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
