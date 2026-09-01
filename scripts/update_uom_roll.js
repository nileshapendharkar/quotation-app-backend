const fs = require('fs');
const path = require('path');

const targetCodes = [
  "FG-401742", "FG-401743", "FG-401744", "FG-401751", "FG-401752", "FG-401753",
  "FG-401754", "FG-401755", "FG-401756", "FG-401745", "FG-401746", "FG-401747",
  "FG-401757", "FG-401758", "FG-401759", "FG-401763", "FG-401764", "FG-401765",
  "FG-401766", "FG-401767", "FG-401768", "FG-401760", "FG-401761", "FG-401762",
  "FG-401769", "FG-401770", "FG-401779", "FG-401771", "FG-401772", "FG-401773"
];

const targetSet = new Set(targetCodes.map(c => c.trim().toUpperCase()));

const dbDataPath = path.join(__dirname, '../database/db_data.json');
const storePath = path.join(__dirname, '../database/store.js');
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
      console.log(`[db_data.json] Updating UOM to ROLL for: ${prod.id} (${prod.name}) [Old UOM: ${prod.uom}]`);
      prod.uom = "ROLL";
      dbUpdatedCount++;
    }
  });
}

fs.writeFileSync(dbDataPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log(`Successfully updated ${dbUpdatedCount} products in db_data.json.`);

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

// 3. Update store.js
let storeContent = fs.readFileSync(storePath, 'utf8');
let storeUpdatedCount = 0;

// Also update initialData objects in store.js by parsing or regex updating uom
targetCodes.forEach(code => {
  const regex = new RegExp(`("${code}":\\s*"[^"]*")`, 'g');
  // Check if present
});

// Write node execution helper for store.js update
console.log("Processing store.js initialData...");
// We will update store.js by replacing uom for products that contain these codes
dbData.products.forEach(prod => {
  if (prod.uom === "ROLL") {
    // If prod.id is in store.js, check if we need to update uom: "MTR" / "NOS" to uom: "ROLL"
    const prodIdRegex = new RegExp(`(id:\\s*"${prod.id}"[\\s\\S]*?uom:\\s*")([^"]*)(")`, 'g');
    if (storeContent.match(prodIdRegex)) {
      storeContent = storeContent.replace(prodIdRegex, `$1ROLL$3`);
      storeUpdatedCount++;
    }
  }
});

fs.writeFileSync(storePath, storeContent, 'utf8');
console.log(`Successfully updated ${storeUpdatedCount} products in store.js.`);

console.log("All UOM updates completed successfully!");
