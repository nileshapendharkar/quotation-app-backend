const fs = require('fs');
const path = require('path');

const dbDataPath = path.join(__dirname, '../database/db_data.json');
const exportDataPath = path.join(__dirname, './catalog_export_data.json');

const newBaseName = "SWR PIPES ISI RINGFIT (3 MTR)";

const sizeMapping = [
  { size: '2 1/2" (75MM) - 3MTR', code: 'FG-401413', aliases: ['2 1/2', '75MM', '2 1/2 75MM', '2 1/2" (75MM)', '2 1/2" (75MM) - 3MTR'] },
  { size: '3" (90MM) - 3MTR', code: 'FG-401414', aliases: ['3', '90MM', '3 90MM', '3" (90MM)', '3" (90MM) - 3MTR'] },
  { size: '4" (110MM) - 3MTR', code: 'FG-401415', aliases: ['4', '110MM', '4 110MM', '4" (110MM)', '4" (110MM) - 3MTR'] },
  { size: '6" (160MM) - 3MTR', code: 'FG-401416', aliases: ['6', '160MM', '6 160MM', '6" (160MM)', '6" (160MM) - 3MTR'] }
];

// 1. Update db_data.json
const dbData = JSON.parse(fs.readFileSync(dbDataPath, 'utf8'));

const prod = dbData.products.find(p => p.id === 'prod_swr_1' || p.name.includes('SWR RINGFIT - RINGFIT PIPE ISI'));
if (prod) {
  console.log(`Updating db_data.json product ${prod.id}: ${prod.name} -> ${newBaseName}`);
  prod.name = newBaseName;
  prod.sizes = sizeMapping.map(s => s.size);
  prod.sizeProductCodes = {};
  
  sizeMapping.forEach(s => {
    prod.sizeProductCodes[s.size] = s.code;
    s.aliases.forEach(alias => {
      prod.sizeProductCodes[alias] = s.code;
    });
  });

  prod.description = `${newBaseName}. Available sizes: 2 1/2" (75MM) - 3MTR, 3" (90MM) - 3MTR, 4" (110MM) - 3MTR, 6" (160MM) - 3MTR.`;
}

fs.writeFileSync(dbDataPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log('Updated db_data.json successfully.');

// 2. Update catalog_export_data.json
const exportData = JSON.parse(fs.readFileSync(exportDataPath, 'utf8'));
let exportCount = 0;

exportData.forEach(row => {
  if (row["Base Product"] === "SWR RINGFIT - RINGFIT PIPE ISI" || row["Product Name"].startsWith("SWR RINGFIT - RINGFIT PIPE ISI")) {
    const sizeVar = String(row["Size / Variant"] || '');
    let matched = sizeMapping.find(s => s.aliases.includes(sizeVar) || sizeVar.includes(s.aliases[0]));
    if (!matched) {
      if (sizeVar.includes('2 1/2') || sizeVar.includes('75')) matched = sizeMapping[0];
      else if (sizeVar.includes('3') || sizeVar.includes('90')) matched = sizeMapping[1];
      else if (sizeVar.includes('4') || sizeVar.includes('110')) matched = sizeMapping[2];
      else if (sizeVar.includes('6') || sizeVar.includes('160')) matched = sizeMapping[3];
    }

    row["Base Product"] = newBaseName;
    if (matched) {
      row["Product Code"] = matched.code;
      row["Size / Variant"] = matched.size;
      row["Product Name"] = `${newBaseName} (${matched.size})`;
    } else {
      row["Product Name"] = `${newBaseName} (${sizeVar})`;
    }
    row["Description"] = `${newBaseName}. Available sizes: 2 1/2" (75MM) - 3MTR, 3" (90MM) - 3MTR, 4" (110MM) - 3MTR, 6" (160MM) - 3MTR.`;
    exportCount++;
  }
});

fs.writeFileSync(exportDataPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log(`Updated ${exportCount} rows in catalog_export_data.json.`);
