const fs = require('fs');
const path = require('path');

const dbDataPath = path.join(__dirname, '../database/db_data.json');
const exportDataPath = path.join(__dirname, './catalog_export_data.json');

const items = [
  { base: "CPVC SOLVENT CEMENT (TIN)", full: "CPVC SOLVENT CEMENT (TIN) (59ML)", size: "59ML", code: "FG-401533" },
  { base: "CPVC SOLVENT CEMENT (TIN)", full: "CPVC SOLVENT CEMENT (TIN) (118ML)", size: "118ML", code: "FG-401534" },
  { base: "CPVC SOLVENT CEMENT (TIN)", full: "CPVC SOLVENT CEMENT (TIN) (237ML)", size: "237ML", code: "FG-401535" },

  { base: "UPVC SOLVENT CEMENT (TIN)", full: "UPVC SOLVENT CEMENT (TIN) (59ML)", size: "59ML", code: "FG-401536" },
  { base: "UPVC SOLVENT CEMENT (TIN)", full: "UPVC SOLVENT CEMENT (TIN) (118ML)", size: "118ML", code: "FG-401537" },
  { base: "UPVC SOLVENT CEMENT (TIN)", full: "UPVC SOLVENT CEMENT (TIN) (237ML)", size: "237ML", code: "FG-401538" },

  { base: "PVC SOLVENT CEMENT (PLASTIC BOTTLE)", full: "PVC SOLVENT CEMENT (PLASTIC BOTTLE) (50ML)", size: "50ML", code: "FG-401639" },
  { base: "PVC SOLVENT CEMENT (PLASTIC BOTTLE)", full: "PVC SOLVENT CEMENT (PLASTIC BOTTLE) (100ML)", size: "100ML", code: "FG-401640" },
  { base: "PVC SOLVENT CEMENT (PLASTIC BOTTLE)", full: "PVC SOLVENT CEMENT (PLASTIC BOTTLE) (250ML)", size: "250ML", code: "FG-401641" }
];

// 1. Update db_data.json
const dbData = JSON.parse(fs.readFileSync(dbDataPath, 'utf8'));

items.forEach(item => {
  const prod = dbData.products.find(p => p.name === item.base);
  if (prod) {
    if (!prod.sizeProductCodes) prod.sizeProductCodes = {};
    prod.sizeProductCodes[item.size] = item.code;
  }
});

fs.writeFileSync(dbDataPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log('Updated db_data.json with solvent Product Codes.');

// 2. Update catalog_export_data.json
const exportData = JSON.parse(fs.readFileSync(exportDataPath, 'utf8'));
let exportCount = 0;

exportData.forEach(row => {
  const matched = items.find(i => 
    row["Product Name"] === i.full || 
    (row["Base Product"] === i.base && String(row["Size / Variant"]).trim() === i.size)
  );

  if (matched) {
    row["Product Code"] = matched.code;
    row["Product Name"] = matched.full;
    row["Base Product"] = matched.base;
    row["Size / Variant"] = matched.size;
    exportCount++;
  }
});

fs.writeFileSync(exportDataPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log(`Updated ${exportCount} rows in catalog_export_data.json with solvent Product Codes.`);
