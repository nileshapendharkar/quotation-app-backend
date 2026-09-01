const fs = require('fs');
const path = require('path');

const dbDataPath = path.join(__dirname, '../database/db_data.json');
const exportDataPath = path.join(__dirname, './catalog_export_data.json');

const items = [
  { base: "REGULAR SERIES LONG BODY BIB TAP", full: "REGULAR SERIES LONG BODY BIB TAP (1/2 inch)", size: "1/2 inch", code: "FG-401559" },
  { base: "REGULAR SERIES PILLAR TAP", full: "REGULAR SERIES PILLAR TAP (1/2 inch)", size: "1/2 inch", code: "FG-401554" },
  { base: "REGULAR SERIES SINK TAP", full: "REGULAR SERIES SINK TAP (1/2 inch)", size: "1/2 inch", code: "FG-401555" },
  { base: "REGULAR SERIES SWAN NECK", full: "REGULAR SERIES SWAN NECK (1/2 inch)", size: "1/2 inch", code: "FG-401556" },
  { base: "REGULAR SERIES ANGULAR VALVE", full: "REGULAR SERIES ANGULAR VALVE (1/2 inch)", size: "1/2 inch", code: "FG-401553" },
  { base: "REGULAR SERIES 2 WAY ANGULAR VALVE", full: "REGULAR SERIES 2 WAY ANGULAR VALVE (1/2 inch)", size: "1/2 inch", code: "FG-401558" },
  { base: "REGULAR SERIES 2 WAY BIB TAP", full: "REGULAR SERIES 2 WAY BIB TAP (1/2 inch)", size: "1/2 inch", code: "FG-401557" },

  { base: "SINGLE SIDE HANDLE FLUSH 8L", full: "SINGLE SIDE HANDLE FLUSH 8L (8L)", size: "8L", code: "FG-400836" },
  { base: "CENTER SINGLE PUSH FLUSH 8L", full: "CENTER SINGLE PUSH FLUSH 8L (8L)", size: "8L", code: "FG-400837" },
  { base: "DUAL FLUSH 10L", full: "DUAL FLUSH 10L (10L)", size: "10L", code: "FG-400838" },
  { base: "EWC SEAT COVER (WITH JET)", full: "EWC SEAT COVER (WITH JET) (Standard)", size: "Standard", code: "FG-400835" },
  { base: "DUAL FLUSH DUAL COLOUR (PREMIUM 10L)", full: "DUAL FLUSH DUAL COLOUR (PREMIUM 10L) (10L)", size: "10L", code: "FG-400840" },
  { base: "DUAL FLUSH DUAL COLOUR (ECONOMY 10L)", full: "DUAL FLUSH DUAL COLOUR (ECONOMY 10L) (10L)", size: "10L", code: "FG-400839" },
  { base: "EWC SEAT COVER (WITHOUT JET)", full: "EWC SEAT COVER (WITHOUT JET) (Standard)", size: "Standard", code: "FG-400834" }
];

// 1. Update db_data.json
const dbData = JSON.parse(fs.readFileSync(dbDataPath, 'utf8'));

items.forEach(item => {
  const prod = dbData.products.find(p => p.name === item.base || p.name === item.full);
  if (prod) {
    prod.productCode = item.code;
    if (!prod.sizeProductCodes) prod.sizeProductCodes = {};
    prod.sizeProductCodes[item.size] = item.code;
    if (item.size === "1/2 inch") {
      prod.sizeProductCodes["1/2"] = item.code;
      prod.sizeProductCodes["1/2\""] = item.code;
    }
  }
});

fs.writeFileSync(dbDataPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log('Updated db_data.json with Regular Faucet and Sanitaryware Product Codes.');

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
console.log(`Updated ${exportCount} rows in catalog_export_data.json with Regular Faucet and Sanitaryware Product Codes.`);
