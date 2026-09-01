const fs = require('fs');
const path = require('path');

const dbDataPath = path.join(__dirname, '../database/db_data.json');
const exportDataPath = path.join(__dirname, './catalog_export_data.json');

const items = [
  { base: "EDGE SERIES SHORT BODY TAP", full: "EDGE SERIES SHORT BODY TAP (1/2 inch)", size: "1/2 inch", code: "FG-401552" },
  { base: "EDGE SERIES LONG BODY TAP", full: "EDGE SERIES LONG BODY TAP (1/2 inch)", size: "1/2 inch", code: "FG-401551" },
  { base: "EDGE SERIES SWAN NECK", full: "EDGE SERIES SWAN NECK (1/2 inch)", size: "1/2 inch", code: "FG-401549" },
  { base: "EDGE SERIES ANGULAR VALVE", full: "EDGE SERIES ANGULAR VALVE (1/2 inch)", size: "1/2 inch", code: "FG-401546" },
  { base: "EDGE SERIES PILLAR TAP", full: "EDGE SERIES PILLAR TAP (1/2 inch)", size: "1/2 inch", code: "FG-401547" },
  { base: "EDGE SERIES 2 WAY BIB TAB", full: "EDGE SERIES 2 WAY BIB TAB (1/2 inch)", size: "1/2 inch", code: "FG-401550" },
  { base: "EDGE SERIES SINK TAP", full: "EDGE SERIES SINK TAP (1/2 inch)", size: "1/2 inch", code: "FG-401548" },

  { base: "SMART SERIES SHORT BODY BIB TAP", full: "SMART SERIES SHORT BODY BIB TAP (1/2 inch)", size: "1/2 inch", code: "FG-401568" },
  { base: "SMART SERIES LONG BODY BIB TAP", full: "SMART SERIES LONG BODY BIB TAP (1/2 inch)", size: "1/2 inch", code: "FG-401567" },
  { base: "SMART SERIES PILLAR TAP", full: "SMART SERIES PILLAR TAP (1/2 inch)", size: "1/2 inch", code: "FG-401562" },
  { base: "SMART SERIES SINK TAP", full: "SMART SERIES SINK TAP (1/2 inch)", size: "1/2 inch", code: "FG-401563" },
  { base: "SMART SERIES SWAN NECK", full: "SMART SERIES SWAN NECK (1/2 inch)", size: "1/2 inch", code: "FG-401564" },
  { base: "SMART SERIES 2 WAY ANGULAR VALVE", full: "SMART SERIES 2 WAY ANGULAR VALVE (1/2 inch)", size: "1/2 inch", code: "FG-401566" },
  { base: "SMART SERIES 2 WAY BIB TAP", full: "SMART SERIES 2 WAY BIB TAP (1/2 inch)", size: "1/2 inch", code: "FG-401565" },

  { base: "REGULAR SERIES SHORT BODY BIB TAP", full: "REGULAR SERIES SHORT BODY BIB TAP (1/2 inch)", size: "1/2 inch", code: "FG-401560" }
];

// 1. Update db_data.json
const dbData = JSON.parse(fs.readFileSync(dbDataPath, 'utf8'));

items.forEach(item => {
  const prod = dbData.products.find(p => p.name === item.base || p.name === item.full);
  if (prod) {
    prod.productCode = item.code;
    if (!prod.sizeProductCodes) prod.sizeProductCodes = {};
    prod.sizeProductCodes["1/2 inch"] = item.code;
    prod.sizeProductCodes["1/2"] = item.code;
    prod.sizeProductCodes["1/2\""] = item.code;
  }
});

fs.writeFileSync(dbDataPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log('Updated db_data.json with PTMT Faucet Product Codes.');

// 2. Update catalog_export_data.json
const exportData = JSON.parse(fs.readFileSync(exportDataPath, 'utf8'));
let exportCount = 0;

exportData.forEach(row => {
  const matched = items.find(i => 
    row["Product Name"] === i.full || 
    row["Base Product"] === i.base
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
console.log(`Updated ${exportCount} rows in catalog_export_data.json with PTMT Faucet Product Codes.`);
