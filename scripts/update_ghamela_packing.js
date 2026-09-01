const fs = require('fs');
const path = require('path');

const updates = {
  "FG-401569": { uom: "BAGS", packing: "75" },
  "FG-401570": { uom: "BAGS", packing: "75" },
  "FG-401571": { uom: "BAGS", packing: "60" },
  "FG-401572": { uom: "BAGS", packing: "60" },
  "FG-401573": { uom: "BAGS", packing: "50" },
  "FG-401574": { uom: "BAGS", packing: "40" },
  "FG-401575": { uom: "BAGS", packing: "40" },
  "FG-401578": { uom: "BAGS", packing: "60" },
  "FG-401579": { uom: "BAGS", packing: "60" }
};

const dbDataPath = path.join(__dirname, '../database/db_data.json');
const exportDataPath = path.join(__dirname, './catalog_export_data.json');

// 1. Update db_data.json
const dbData = JSON.parse(fs.readFileSync(dbDataPath, 'utf8'));
let dbCount = 0;

if (dbData.products && Array.isArray(dbData.products)) {
  dbData.products.forEach(prod => {
    let matchedCode = null;
    if (prod.sizeProductCodes) {
      Object.values(prod.sizeProductCodes).forEach(code => {
        if (updates[code]) matchedCode = code;
      });
    }
    if (prod.code && updates[prod.code]) matchedCode = prod.code;
    if (prod.productCode && updates[prod.productCode]) matchedCode = prod.productCode;

    if (matchedCode) {
      const cfg = updates[matchedCode];
      console.log(`[db_data.json] Updating ${prod.id} (${prod.name}) -> UOM: ${cfg.uom}, Packing: ${cfg.packing}`);
      prod.uom = cfg.uom;
      prod.packing = cfg.packing;

      if (prod.sizeProductCodes) {
        prod.packSizes = {};
        Object.keys(prod.sizeProductCodes).forEach(sz => {
          prod.packSizes[sz] = cfg.packing;
        });
      }
      dbCount++;
    }
  });
}

fs.writeFileSync(dbDataPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log(`Updated ${dbCount} products in db_data.json`);

// 2. Update catalog_export_data.json
const exportData = JSON.parse(fs.readFileSync(exportDataPath, 'utf8'));
let exportCount = 0;

if (Array.isArray(exportData)) {
  exportData.forEach(row => {
    const code = row["Product Code"] ? String(row["Product Code"]).trim() : '';
    if (updates[code]) {
      const cfg = updates[code];
      console.log(`[catalog_export_data.json] Updating ${code} (${row["Product Name"]}) -> UOM: ${cfg.uom}, Packing: ${cfg.packing}`);
      row["UOM"] = cfg.uom;
      row["Packing / Pack Size"] = cfg.packing;
      exportCount++;
    }
  });
}

fs.writeFileSync(exportDataPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log(`Updated ${exportCount} items in catalog_export_data.json`);
console.log("All UOM and Packing updates completed successfully!");
