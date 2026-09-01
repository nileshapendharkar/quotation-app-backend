const fs = require('fs');
const path = require('path');

const targetCodes = [
  "FG-400921", "FG-400927", "FG-400922", "FG-400928", "FG-400923", "FG-400929",
  "FG-400924", "FG-400930", "FG-400925", "FG-400931", "FG-400926", "FG-400932",
  "FG-400909", "FG-400915", "FG-400910", "FG-400916", "FG-400911", "FG-400917",
  "FG-400912", "FG-400918", "FG-400913", "FG-400919", "FG-400914", "FG-400920",
  "FG-400939", "FG-400942", "FG-400940", "FG-400943", "FG-400941", "FG-400944",
  "FG-400933", "FG-400936", "FG-400934", "FG-400937", "FG-400935", "FG-400938",
  "FG-400853", "FG-400859", "FG-400854", "FG-400860", "FG-400855", "FG-400861",
  "FG-400856", "FG-400862", "FG-400857", "FG-400863", "FG-400858", "FG-400864",
  "FG-400865", "FG-400871", "FG-400866", "FG-400872", "FG-400867", "FG-400873",
  "FG-400868", "FG-400874", "FG-400869", "FG-400875", "FG-400870", "FG-400876",
  "FG-400877", "FG-400883", "FG-400878", "FG-400884", "FG-400879", "FG-400885",
  "FG-400880", "FG-400886", "FG-400881", "FG-400887", "FG-400882", "FG-400888"
];

const targetSet = new Set(targetCodes.map(c => c.trim().toUpperCase()));

const dbDataPath = path.join(__dirname, '../database/db_data.json');
const exportDataPath = path.join(__dirname, './catalog_export_data.json');

console.log(`Targeting ${targetSet.size} Product Codes for UOM -> BDL update...`);

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
      console.log(`[db_data.json] Updating UOM to BDL for product: ${prod.id} (${prod.name}) [Old UOM: ${prod.uom}]`);
      prod.uom = "BDL";
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
      console.log(`[catalog_export_data.json] Updating UOM to BDL for Code ${code}: ${row["Product Name"]} [Old UOM: ${row["UOM"]}]`);
      row["UOM"] = "BDL";
      exportUpdatedCount++;
    }
  });
}

fs.writeFileSync(exportDataPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log(`Successfully updated ${exportUpdatedCount} items in catalog_export_data.json.`);
console.log("All UOM -> BDL updates completed successfully!");
