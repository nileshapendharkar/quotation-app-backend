const fs = require('fs');
const path = require('path');

const dbDataPath = path.join(__dirname, '../database/db_data.json');
const exportDataPath = path.join(__dirname, './catalog_export_data.json');

const items = [
  { base: "RUBBER LUBRICANT (PLASTIC BOTTLE)", full: "RUBBER LUBRICANT (PLASTIC BOTTLE) (50ML)", size: "50ML", code: "FG-401645" },
  { base: "RUBBER LUBRICANT (PLASTIC BOTTLE)", full: "RUBBER LUBRICANT (PLASTIC BOTTLE) (100ML)", size: "100ML", code: "FG-401646" },
  { base: "RUBBER LUBRICANT (PLASTIC BOTTLE)", full: "RUBBER LUBRICANT (PLASTIC BOTTLE) (250ML)", size: "250ML", code: "FG-401647" }
];

// 1. Update db_data.json
const dbData = JSON.parse(fs.readFileSync(dbDataPath, 'utf8'));

['prod_solvent_9', 'prod_solvent_10'].forEach(id => {
  const prod = dbData.products.find(p => p.id === id || p.name.includes("RUBBER LUBRICANT"));
  if (prod) {
    if (!prod.sizeProductCodes) prod.sizeProductCodes = {};
    items.forEach(i => {
      prod.sizeProductCodes[i.size] = i.code;
    });
  }
});

fs.writeFileSync(dbDataPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log('Updated db_data.json for Rubber Lubricant Product Codes.');

// 2. Update catalog_export_data.json
const exportData = JSON.parse(fs.readFileSync(exportDataPath, 'utf8'));
let exportCount = 0;

exportData.forEach(row => {
  if (row["Base Product"] === "RUBBER LUBRICANT (PLASTIC BOTTLE)" || row["Product Name"].startsWith("RUBBER LUBRICANT (PLASTIC BOTTLE)")) {
    const sizeVar = String(row["Size / Variant"] || '').trim();
    const matched = items.find(i => i.size === sizeVar);
    if (matched) {
      row["Product Code"] = matched.code;
      row["Product Name"] = matched.full;
      row["Base Product"] = matched.base;
      row["Size / Variant"] = matched.size;
      exportCount++;
    }
  }
});

fs.writeFileSync(exportDataPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log(`Updated ${exportCount} rows in catalog_export_data.json for Rubber Lubricant.`);
