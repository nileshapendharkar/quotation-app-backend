const fs = require('fs');
const path = require('path');

const dbDataPath = path.join(__dirname, '../database/db_data.json');
const exportDataPath = path.join(__dirname, './catalog_export_data.json');

const packMap = {
  "FG-401413": 1,
  "FG-401414": 1,
  "FG-401415": 1,
  "FG-401416": 1,
  "FG-401425": 1,
  "FG-401426": 1,
  "FG-401427": 1,
  "FG-401428": 1,
  "FG-401533": 30,
  "FG-401534": 24,
  "FG-401535": 24,
  "FG-401536": 30,
  "FG-401537": 24,
  "FG-401538": 24,
  "FG-401639": 36,
  "FG-401640": 18,
  "FG-401641": 12,
  "FG-401645": 36,
  "FG-401646": 18,
  "FG-401647": 18,
  "FG-401552": 20,
  "FG-401551": 18,
  "FG-401549": 8,
  "FG-401546": 30,
  "FG-401547": 14,
  "FG-401550": 6,
  "FG-401548": 8,
  "FG-401568": 52,
  "FG-401567": 52,
  "FG-401562": 26,
  "FG-401563": 26,
  "FG-401564": 26,
  "FG-401561": 52,
  "FG-401566": 26,
  "FG-401565": 26,
  "FG-401560": 52,
  "FG-401559": 52,
  "FG-401554": 26,
  "FG-401555": 26,
  "FG-401556": 26,
  "FG-401553": 52,
  "FG-401558": 26,
  "FG-401557": 26,
  "FG-400836": 10,
  "FG-400837": 10,
  "FG-400838": 10,
  "FG-400835": 20,
  "FG-400840": 10,
  "FG-400839": 10,
  "FG-400834": 20
};

// 1. Update db_data.json
const dbData = JSON.parse(fs.readFileSync(dbDataPath, 'utf8'));
let dbCount = 0;

dbData.products.forEach(p => {
  if (p.sizeProductCodes) {
    if (!p.packSizes) p.packSizes = {};
    Object.keys(p.sizeProductCodes).forEach(sz => {
      const code = p.sizeProductCodes[sz];
      if (packMap[code] !== undefined) {
        p.packSizes[sz] = packMap[code];
        p.packing = packMap[code];
        p.packSize = packMap[code];
        dbCount++;
      }
    });
  } else if (p.productCode && packMap[p.productCode] !== undefined) {
    p.packing = packMap[p.productCode];
    p.packSize = packMap[p.productCode];
    dbCount++;
  }
});

fs.writeFileSync(dbDataPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log(`Updated ${dbCount} packing mappings in db_data.json.`);

// 2. Update catalog_export_data.json
const exportData = JSON.parse(fs.readFileSync(exportDataPath, 'utf8'));
let exportCount = 0;

exportData.forEach(row => {
  const code = row["Product Code"];
  if (code && packMap[code] !== undefined) {
    row["Packing / Pack Size"] = packMap[code];
    exportCount++;
  }
});

fs.writeFileSync(exportDataPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log(`Updated ${exportCount} rows in catalog_export_data.json with Packing values.`);
