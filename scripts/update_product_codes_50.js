const fs = require('fs');
const path = require('path');

const rawMappings = [
  { full: "SWR RINGFIT - RINGFIT PIPE ISI (2 1/2)", code: "FG-401413", base: "SWR RINGFIT - RINGFIT PIPE ISI", size: "2 1/2" },
  { full: "SWR RINGFIT - RINGFIT PIPE ISI (3)", code: "FG-401414", base: "SWR RINGFIT - RINGFIT PIPE ISI", size: "3" },
  { full: "SWR RINGFIT - RINGFIT PIPE ISI (4)", code: "FG-401415", base: "SWR RINGFIT - RINGFIT PIPE ISI", size: "4" },
  { full: "SWR RINGFIT - RINGFIT PIPE ISI (6)", code: "FG-401416", base: "SWR RINGFIT - RINGFIT PIPE ISI", size: "6" },
  { full: "SWR RINGFIT - RINGFIT PIPE (2 1/2)", code: "FG-401425", base: "SWR RINGFIT - RINGFIT PIPE", size: "2 1/2" },
  { full: "SWR RINGFIT - RINGFIT PIPE (3)", code: "FG-401426", base: "SWR RINGFIT - RINGFIT PIPE", size: "3" },
  { full: "SWR RINGFIT - RINGFIT PIPE (4)", code: "FG-401427", base: "SWR RINGFIT - RINGFIT PIPE", size: "4" },
  { full: "SWR RINGFIT - RINGFIT PIPE (6)", code: "FG-401428", base: "SWR RINGFIT - RINGFIT PIPE", size: "6" },
  { full: "CPVC SOLVENT CEMENT (TIN) (59ML)", code: "FG-401533", base: "CPVC SOLVENT CEMENT (TIN)", size: "59ML" },
  { full: "CPVC SOLVENT CEMENT (TIN) (118ML)", code: "FG-401534", base: "CPVC SOLVENT CEMENT (TIN)", size: "118ML" },
  { full: "CPVC SOLVENT CEMENT (TIN) (237ML)", code: "FG-401535", base: "CPVC SOLVENT CEMENT (TIN)", size: "237ML" },
  { full: "UPVC SOLVENT CEMENT (TIN) (59ML)", code: "FG-401536", base: "UPVC SOLVENT CEMENT (TIN)", size: "59ML" },
  { full: "UPVC SOLVENT CEMENT (TIN) (118ML)", code: "FG-401537", base: "UPVC SOLVENT CEMENT (TIN)", size: "118ML" },
  { full: "UPVC SOLVENT CEMENT (TIN) (237ML)", code: "FG-401538", base: "UPVC SOLVENT CEMENT (TIN)", size: "237ML" },
  { full: "PVC SOLVENT CEMENT (PLASTIC BOTTLE) (50ML)", code: "FG-401639", base: "PVC SOLVENT CEMENT (PLASTIC BOTTLE)", size: "50ML" },
  { full: "PVC SOLVENT CEMENT (PLASTIC BOTTLE) (100ML)", code: "FG-401640", base: "PVC SOLVENT CEMENT (PLASTIC BOTTLE)", size: "100ML" },
  { full: "PVC SOLVENT CEMENT (PLASTIC BOTTLE) (250ML)", code: "FG-401641", base: "PVC SOLVENT CEMENT (PLASTIC BOTTLE)", size: "250ML" },
  { full: "RUBBER LUBRICANT (PLASTIC BOTTLE) (50ML)", code: "FG-401645", base: "RUBBER LUBRICANT (PLASTIC BOTTLE)", size: "50ML" },
  { full: "RUBBER LUBRICANT (PLASTIC BOTTLE) (100ML)", code: "FG-401646", base: "RUBBER LUBRICANT (PLASTIC BOTTLE)", size: "100ML" },
  { full: "RUBBER LUBRICANT (PLASTIC BOTTLE) (250ML)", code: "FG-401647", base: "RUBBER LUBRICANT (PLASTIC BOTTLE)", size: "250ML" },
  { full: "EDGE SERIES SHORT BODY TAP (1/2 inch)", code: "FG-401552", base: "EDGE SERIES SHORT BODY TAP", size: "1/2 inch" },
  { full: "EDGE SERIES LONG BODY TAP (1/2 inch)", code: "FG-401551", base: "EDGE SERIES LONG BODY TAP", size: "1/2 inch" },
  { full: "EDGE SERIES SWAN NECK (1/2 inch)", code: "FG-401549", base: "EDGE SERIES SWAN NECK", size: "1/2 inch" },
  { full: "EDGE SERIES ANGULAR VALVE (1/2 inch)", code: "FG-401546", base: "EDGE SERIES ANGULAR VALVE", size: "1/2 inch" },
  { full: "EDGE SERIES PILLAR TAP (1/2 inch)", code: "FG-401547", base: "EDGE SERIES PILLAR TAP", size: "1/2 inch" },
  { full: "EDGE SERIES 2 WAY BIB TAB (1/2 inch)", code: "FG-401550", base: "EDGE SERIES 2 WAY BIB TAB", size: "1/2 inch" },
  { full: "EDGE SERIES SINK TAP (1/2 inch)", code: "FG-401548", base: "EDGE SERIES SINK TAP", size: "1/2 inch" },
  { full: "SMART SERIES SHORT BODY BIB TAP (1/2 inch)", code: "FG-401568", base: "SMART SERIES SHORT BODY BIB TAP", size: "1/2 inch" },
  { full: "SMART SERIES LONG BODY BIB TAP (1/2 inch)", code: "FG-401567", base: "SMART SERIES LONG BODY BIB TAP", size: "1/2 inch" },
  { full: "SMART SERIES PILLAR TAP (1/2 inch)", code: "FG-401562", base: "SMART SERIES PILLAR TAP", size: "1/2 inch" },
  { full: "SMART SERIES SINK TAP (1/2 inch)", code: "FG-401563", base: "SMART SERIES SINK TAP", size: "1/2 inch" },
  { full: "SMART SERIES SWAN NECK (1/2 inch)", code: "FG-401564", base: "SMART SERIES SWAN NECK", size: "1/2 inch" },
  { full: "SMART SERIES ANGULAR VALVE (1/2 inch)", code: "FG-401561", base: "SMART SERIES ANGULAR VALVE", size: "1/2 inch" },
  { full: "SMART SERIES 2 WAY ANGULAR VALVE (1/2 inch)", code: "FG-401566", base: "SMART SERIES 2 WAY ANGULAR VALVE", size: "1/2 inch" },
  { full: "SMART SERIES 2 WAY BIB TAP (1/2 inch)", code: "FG-401565", base: "SMART SERIES 2 WAY BIB TAP", size: "1/2 inch" },
  { full: "REGULAR SERIES SHORT BODY BIB TAP (1/2 inch)", code: "FG-401560", base: "REGULAR SERIES SHORT BODY BIB TAP", size: "1/2 inch" },
  { full: "REGULAR SERIES LONG BODY BIB TAP (1/2 inch)", code: "FG-401559", base: "REGULAR SERIES LONG BODY BIB TAP", size: "1/2 inch" },
  { full: "REGULAR SERIES PILLAR TAP (1/2 inch)", code: "FG-401554", base: "REGULAR SERIES PILLAR TAP", size: "1/2 inch" },
  { full: "REGULAR SERIES SINK TAP (1/2 inch)", code: "FG-401555", base: "REGULAR SERIES SINK TAP", size: "1/2 inch" },
  { full: "REGULAR SERIES SWAN NECK (1/2 inch)", code: "FG-401556", base: "REGULAR SERIES SWAN NECK", size: "1/2 inch" },
  { full: "REGULAR SERIES ANGULAR VALVE (1/2 inch)", code: "FG-401553", base: "REGULAR SERIES ANGULAR VALVE", size: "1/2 inch" },
  { full: "REGULAR SERIES 2 WAY ANGULAR VALVE (1/2 inch)", code: "FG-401558", base: "REGULAR SERIES 2 WAY ANGULAR VALVE", size: "1/2 inch" },
  { full: "REGULAR SERIES 2 WAY BIB TAP (1/2 inch)", code: "FG-401557", base: "REGULAR SERIES 2 WAY BIB TAP", size: "1/2 inch" },
  { full: "SINGLE SIDE HANDLE FLUSH 8L (8L)", code: "FG-400836", base: "SINGLE SIDE HANDLE FLUSH 8L", size: "8L" },
  { full: "CENTER SINGLE PUSH FLUSH 8L (8L)", code: "FG-400837", base: "CENTER SINGLE PUSH FLUSH 8L", size: "8L" },
  { full: "DUAL FLUSH 10L (10L)", code: "FG-400838", base: "DUAL FLUSH 10L", size: "10L" },
  { full: "EWC SEAT COVER (WITH JET) (Standard)", code: "FG-400835", base: "EWC SEAT COVER (WITH JET)", size: "Standard" },
  { full: "DUAL FLUSH DUAL COLOUR (PREMIUM 10L) (10L)", code: "FG-400840", base: "DUAL FLUSH DUAL COLOUR (PREMIUM 10L)", size: "10L" },
  { full: "DUAL FLUSH DUAL COLOUR (ECONOMY 10L) (10L)", code: "FG-400839", base: "DUAL FLUSH DUAL COLOUR (ECONOMY 10L)", size: "10L" },
  { full: "EWC SEAT COVER (WITHOUT JET) (Standard)", code: "FG-400834", base: "EWC SEAT COVER (WITHOUT JET)", size: "Standard" }
];

const clean = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const dbDataPath = path.join(__dirname, '../database/db_data.json');
const exportDataPath = path.join(__dirname, './catalog_export_data.json');

// 1. Update catalog_export_data.json
const exportData = JSON.parse(fs.readFileSync(exportDataPath, 'utf8'));
let exportUpdated = 0;

rawMappings.forEach(item => {
  const targetClean = clean(item.full);
  const baseClean = clean(item.base);
  const sizeClean = clean(item.size);

  let matched = false;
  exportData.forEach(row => {
    const rowFullClean = clean(row["Product Name"]);
    const rowBaseClean = clean(row["Base Product"]);
    const rowSizeClean = clean(row["Size / Variant"]);

    if (rowFullClean === targetClean || (rowBaseClean === baseClean && rowSizeClean === sizeClean)) {
      console.log(`[exportData] Match for "${item.full}" -> Row #${row["Sr No"]} (${row["Product Name"]}) => New Code: ${item.code}`);
      row["Product Code"] = item.code;
      exportUpdated++;
      matched = true;
    }
  });

  if (!matched) {
    // Try relaxed search
    exportData.forEach(row => {
      const rowFullClean = clean(row["Product Name"]);
      if (rowFullClean.includes(baseClean) && rowFullClean.includes(sizeClean)) {
        console.log(`[exportData] Relaxed Match for "${item.full}" -> Row #${row["Sr No"]} (${row["Product Name"]}) => New Code: ${item.code}`);
        row["Product Code"] = item.code;
        exportUpdated++;
        matched = true;
      }
    });
  }

  if (!matched) {
    console.warn(`[exportData] NO MATCH found for "${item.full}"`);
  }
});

fs.writeFileSync(exportDataPath, JSON.stringify(exportData, null, 2), 'utf8');
console.log(`Updated ${exportUpdated} rows in catalog_export_data.json`);

// 2. Update db_data.json
const dbData = JSON.parse(fs.readFileSync(dbDataPath, 'utf8'));
let dbUpdated = 0;

rawMappings.forEach(item => {
  const baseClean = clean(item.base);
  const sizeClean = clean(item.size);
  const fullClean = clean(item.full);

  if (dbData.products && Array.isArray(dbData.products)) {
    dbData.products.forEach(prod => {
      const prodNameClean = clean(prod.name);
      if (prodNameClean === baseClean || fullClean.includes(prodNameClean)) {
        if (!prod.sizeProductCodes) prod.sizeProductCodes = {};

        // Find matching size key
        let sizeKey = Object.keys(prod.sizeProductCodes).find(k => clean(k) === sizeClean);
        if (!sizeKey && prod.sizes && Array.isArray(prod.sizes)) {
          sizeKey = prod.sizes.find(k => clean(k) === sizeClean);
        }
        if (!sizeKey) {
          sizeKey = item.size; // fallback to item size
        }

        console.log(`[dbData] Updating Product ${prod.id} (${prod.name}) size "${sizeKey}" -> ${item.code}`);
        prod.sizeProductCodes[sizeKey] = item.code;
        if (prod.sizes && !prod.sizes.includes(sizeKey)) prod.sizes.push(sizeKey);
        dbUpdated++;
      }
    });
  }
});

fs.writeFileSync(dbDataPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log(`Updated ${dbUpdated} product entries in db_data.json`);
