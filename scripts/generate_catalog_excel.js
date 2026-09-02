const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dbFile = path.join(__dirname, '../database/db_data.json');
if (!fs.existsSync(dbFile)) {
  console.error('Database file not found:', dbFile);
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

// Build lookup maps for subcategories
const subcatMap = {};
if (db.subCategories) {
  db.subCategories.forEach(sc => {
    subcatMap[sc.id] = sc.name;
  });
}

const rows = [];
let srNo = 1;

db.products.forEach(p => {
  const categoryName = p.categoryName || 'General';
  const subcatName = p.subcategoryId ? (subcatMap[p.subcategoryId] || p.subcategoryId) : (p.subCategory || 'General');
  const uom = p.uom || 'Nos';
  const status = p.status || 'Active';
  const description = p.description || '';

  // If sizeProductCodes or sizes exist, list each size item
  if (p.sizeProductCodes && Object.keys(p.sizeProductCodes).length > 0) {
    Object.entries(p.sizeProductCodes).forEach(([size, code]) => {
      const packQty = (p.packings && p.packings[size]) ? p.packings[size] : ((p.packSizes && p.packSizes[size]) ? p.packSizes[size] : '-');
      rows.push({
        'Sr No': srNo++,
        'Product Code': code || (p.code || '-'),
        'Product Name': p.name + ' (' + size + ')',
        'Base Product': p.name,
        'Category': categoryName,
        'SubCategory': subcatName,
        'Size / Variant': size,
        'UOM': uom,
        'Packing / Pack Size': packQty,
        'Status': status,
        'Description': description
      });
    });
  } else if (p.sizes && Array.isArray(p.sizes) && p.sizes.length > 0) {
    p.sizes.forEach(size => {
      const packQty = (p.packings && p.packings[size]) ? p.packings[size] : ((p.packSizes && p.packSizes[size]) ? p.packSizes[size] : '-');
      const code = (p.sizeProductCodes && p.sizeProductCodes[size]) ? p.sizeProductCodes[size] : (p.code || '-');
      rows.push({
        'Sr No': srNo++,
        'Product Code': code,
        'Product Name': p.name + ' (' + size + ')',
        'Base Product': p.name,
        'Category': categoryName,
        'SubCategory': subcatName,
        'Size / Variant': size,
        'UOM': uom,
        'Packing / Pack Size': packQty,
        'Status': status,
        'Description': description
      });
    });
  } else {
    rows.push({
      'Sr No': srNo++,
      'Product Code': p.code || '-',
      'Product Name': p.name,
      'Base Product': p.name,
      'Category': categoryName,
      'SubCategory': subcatName,
      'Size / Variant': 'Standard',
      'UOM': uom,
      'Packing / Pack Size': p.packing || p.packSize || '-',
      'Status': status,
      'Description': description
    });
  }
});

console.log('Total product variants catalogued:', rows.length);

const worksheet = XLSX.utils.json_to_sheet(rows);

// Format column widths
worksheet['!cols'] = [
  { wch: 6 },  // Sr No
  { wch: 18 }, // Product Code
  { wch: 48 }, // Product Name
  { wch: 32 }, // Base Product
  { wch: 30 }, // Category
  { wch: 30 }, // SubCategory
  { wch: 18 }, // Size / Variant
  { wch: 10 }, // UOM
  { wch: 22 }, // Packing / Pack Size
  { wch: 10 }, // Status
  { wch: 50 }  // Description
];

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Products Catalog');

const backendPublicDir = path.join(__dirname, '../public');
if (!fs.existsSync(backendPublicDir)) fs.mkdirSync(backendPublicDir, { recursive: true });

const excelPath = path.join(backendPublicDir, 'Gouri_Aqua_Plast_Products_Catalog.xlsx');
XLSX.writeFile(workbook, excelPath);
console.log('✅ Generated Excel Catalog at:', excelPath);

// Output summary report
fs.writeFileSync(path.join(__dirname, 'catalog_export_data.json'), JSON.stringify(rows, null, 2));
