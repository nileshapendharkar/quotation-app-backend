const { readData, writeData } = require('../database/store');

// Product IDs that should always appear first, in display order
const PINNED_PRODUCT_IDS = ['prod_tank_1']; // HDPE 10L GOLD GAP

exports.getAllProducts = async (req, res) => {
  try {
    const { categoryId, subcategoryId, search, includeInactive } = req.query;
    const data = await readData();
    let products = [...data.products];

    // Unless explicitly requested by Admin (includeInactive=true), show only Active products
    if (includeInactive !== 'true') {
      products = products.filter(p => p.status !== 'Inactive');
    }

    if (categoryId) {
      products = products.filter(p => p.categoryId === categoryId);
    }

    if (subcategoryId) {
      products = products.filter(p => p.subcategoryId === subcategoryId);
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.sizeProductCodes && Object.values(p.sizeProductCodes).some(code => String(code).toLowerCase().includes(q)))
      );
    }

    // Pin featured products to the top (only those that survived filtering)
    products.sort((a, b) => {
      const aPin = PINNED_PRODUCT_IDS.indexOf(a.id);
      const bPin = PINNED_PRODUCT_IDS.indexOf(b.id);
      if (aPin !== -1 && bPin !== -1) return aPin - bPin; // both pinned: preserve pin order
      if (aPin !== -1) return -1; // a pinned, b not
      if (bPin !== -1) return 1;  // b pinned, a not
      return 0; // neither pinned: preserve original order
    });

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readData();
    const product = data.products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { code, name, image, categoryId, subcategoryId, description, details, specification, sizes, packSizes, sizeProductCodes, status, uom } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ success: false, message: 'Product Name and Category are required' });
    }

    const data = await readData();
    const category = data.categories.find(c => c.id === categoryId);

    const parsedSizes = Array.isArray(sizes) 
      ? sizes 
      : (sizes ? String(sizes).split(',').map(s => s.trim()).filter(Boolean) : []);

    const newProduct = {
      id: 'prod_' + Date.now(),
      code: code || ('PRD-' + String(Date.now()).slice(-5)),
      name,
      categoryId,
      subcategoryId: subcategoryId || null,
      categoryName: category ? category.name : 'General',
      uom: uom || 'Nos',
      image: image || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&q=80',
      description: description || '',
      details: details || '',
      specification: specification || '',
      sizes: parsedSizes,
      packSizes: packSizes || {},
      sizeProductCodes: sizeProductCodes || {},
      status: status || 'Active'
    };

    data.products.push(newProduct);
    await writeData(data);

    res.status(201).json({ success: true, message: 'Product created and synced to database', product: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, image, categoryId, subcategoryId, description, details, specification, sizes, packSizes, sizeProductCodes, status, uom } = req.body;

    const data = await readData();
    const product = data.products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (code !== undefined) product.code = code;
    if (name) product.name = name;
    if (uom !== undefined) product.uom = uom;
    if (image) product.image = image;
    if (description !== undefined) product.description = description;
    if (details !== undefined) product.details = details;
    if (specification !== undefined) product.specification = specification;
    if (sizes !== undefined) {
      product.sizes = Array.isArray(sizes) 
        ? sizes 
        : (sizes ? String(sizes).split(',').map(s => s.trim()).filter(Boolean) : []);
    }
    if (packSizes !== undefined) product.packSizes = packSizes;
    if (sizeProductCodes !== undefined) product.sizeProductCodes = sizeProductCodes;
    if (status !== undefined) product.status = status;

    if (categoryId) {
      product.categoryId = categoryId;
      const cat = data.categories.find(c => c.id === categoryId);
      if (cat) product.categoryName = cat.name;
    }

    if (subcategoryId !== undefined) {
      product.subcategoryId = subcategoryId;
    }

    await writeData(data);
    res.json({ success: true, message: 'Product updated and synced to database', product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readData();
    const idx = data.products.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    data.products.splice(idx, 1);
    await writeData(data);

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.importExcelProducts = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided for import' });
    }

    const data = await readData();
    const categories = data.categories || [];

    // Helper to detect category by name keywords or fallback
    const detectCategory = (name, categoryName) => {
      if (categoryName) {
        const found = categories.find(c => c.name.toLowerCase() === String(categoryName).toLowerCase().trim());
        if (found) return found;
      }
      const lower = (name || '').toLowerCase();
      if (lower.includes('tank')) return categories.find(c => c.id === 'cat_tanks') || categories[0];
      if (lower.includes('cpvc')) return categories.find(c => c.id === 'cat_cpvc') || categories[0];
      if (lower.includes('upvc')) return categories.find(c => c.id === 'cat_upvc') || categories[0];
      if (lower.includes('swr')) return categories.find(c => c.id === 'cat_swr') || categories[0];
      if (lower.includes('casing')) return categories.find(c => c.id === 'cat_casing') || categories[0];
      if (lower.includes('agri')) return categories.find(c => c.id === 'cat_agri') || categories[0];
      if (lower.includes('hdpe')) return categories.find(c => c.id === 'cat_hdpe') || categories[0];
      if (lower.includes('sprinkler')) return categories.find(c => c.id === 'cat_sprinkler') || categories[0];
      if (lower.includes('column')) return categories.find(c => c.id === 'cat_column') || categories[0];
      if (lower.includes('solvent') || lower.includes('lubricant')) return categories.find(c => c.id === 'cat_solvent') || categories[0];
      if (lower.includes('drip')) return categories.find(c => c.id === 'cat_drip') || categories[0];
      if (lower.includes('ghamela') || lower.includes('household')) return categories.find(c => c.id === 'cat_household') || categories[0];
      if (lower.includes('faucet')) return categories.find(c => c.id === 'cat_faucets') || categories[0];
      if (lower.includes('dwc')) return categories.find(c => c.id === 'cat_dwc') || categories[0];
      if (lower.includes('sanitary') || lower.includes('seat')) return categories.find(c => c.id === 'cat_sanitary') || categories[0];
      return categories[0] || { id: 'cat_cpvc', name: 'CPVC Pipes & Fittings' };
    };

    let updatedCount = 0;
    let createdCount = 0;

    for (const item of items) {
      const code = item.code ? String(item.code).trim() : '';
      const name = item.name ? String(item.name).trim() : '';
      const uom = item.uom ? String(item.uom).trim() : 'Nos';
      const size = item.size !== undefined && item.size !== null ? String(item.size).trim() : '';
      let packing = item.packing !== undefined && item.packing !== null ? String(item.packing).trim() : '';
      if (packing !== '' && !isNaN(Number(packing))) {
        packing = Number(packing);
      }

      if (!name && !code) continue;

      // 1. Check if an item with this unique Product Code already exists
      let existingProduct = null;
      let matchedSize = null;

      if (code) {
        for (const p of data.products) {
          // Check sizeProductCodes
          if (p.sizeProductCodes && typeof p.sizeProductCodes === 'object') {
            for (const [sz, cd] of Object.entries(p.sizeProductCodes)) {
              if (String(cd).trim().toLowerCase() === code.toLowerCase()) {
                existingProduct = p;
                matchedSize = sz;
                break;
              }
            }
          }
          if (existingProduct) break;

          // Check direct code or productCode
          if ((p.code && String(p.code).trim().toLowerCase() === code.toLowerCase()) ||
              (p.productCode && String(p.productCode).trim().toLowerCase() === code.toLowerCase())) {
            existingProduct = p;
            break;
          }
        }
      }

      if (existingProduct) {
        // Unique item found by Product Code -> Update it
        if (name) existingProduct.name = name;
        if (uom) existingProduct.uom = uom;
        
        if (matchedSize) {
          // Variant matched by sizeProductCode
          if (!existingProduct.packSizes) existingProduct.packSizes = {};
          if (packing !== '') existingProduct.packSizes[matchedSize] = packing;
          if (size && size !== '-' && size !== matchedSize) {
            // Updated size label
            const sIdx = (existingProduct.sizes || []).indexOf(matchedSize);
            if (sIdx !== -1) existingProduct.sizes[sIdx] = size;
            delete existingProduct.sizeProductCodes[matchedSize];
            delete existingProduct.packSizes[matchedSize];
            existingProduct.sizeProductCodes[size] = code;
            existingProduct.packSizes[size] = packing;
          }
        } else if (size && size !== '-') {
          // Existing product matched by code, and has size
          if (!existingProduct.sizes) existingProduct.sizes = [];
          if (!existingProduct.sizes.includes(size)) existingProduct.sizes.push(size);
          if (!existingProduct.sizeProductCodes) existingProduct.sizeProductCodes = {};
          if (!existingProduct.packSizes) existingProduct.packSizes = {};
          existingProduct.sizeProductCodes[size] = code;
          if (packing !== '') existingProduct.packSizes[size] = packing;
        } else {
          // Single product
          if (code) existingProduct.code = code;
          if (packing !== '') existingProduct.packing = packing;
        }
        updatedCount++;
      } else {
        // 2. Product Code is unique/new
        // Check if there is an existing product with same name to attach size to
        const prodByName = data.products.find(p => p.name && p.name.trim().toLowerCase() === name.toLowerCase());

        if (prodByName && size && size !== '-') {
          // Attach as a new size variant to existing product
          if (!prodByName.sizes) prodByName.sizes = [];
          if (!prodByName.sizes.includes(size)) prodByName.sizes.push(size);
          if (!prodByName.sizeProductCodes) prodByName.sizeProductCodes = {};
          if (!prodByName.packSizes) prodByName.packSizes = {};
          
          prodByName.sizeProductCodes[size] = code || ('FG-' + Math.floor(100000 + Math.random() * 900000));
          if (packing !== '') prodByName.packSizes[size] = packing;
          if (uom) prodByName.uom = uom;
          updatedCount++;
        } else {
          // Create brand new product
          const cat = detectCategory(name, item.categoryName || item.category);
          const newId = 'prod_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
          const isVariant = size && size !== '-';

          const newProduct = {
            id: newId,
            name: name || ('Product ' + code),
            uom: uom || 'Nos',
            categoryId: cat.id,
            categoryName: cat.name,
            subcategoryId: null,
            image: item.image || '/images/default-product.png',
            description: `${name}.${isVariant ? ' Available sizes: ' + size + '.' : ''}`,
            status: 'Active',
            sizes: isVariant ? [size] : [],
            packSizes: isVariant && packing !== '' ? { [size]: packing } : {},
            sizeProductCodes: isVariant && code ? { [size]: code } : {},
            ...(isVariant ? {} : { code: code || ('PRD-' + Date.now().toString().slice(-5)), packing: packing !== '' ? packing : '-' })
          };

          data.products.push(newProduct);
          createdCount++;
        }
      }
    }

    await writeData(data);

    res.json({
      success: true,
      message: `Import complete: ${createdCount} new items created, ${updatedCount} items updated.`,
      createdCount,
      updatedCount,
      totalCount: items.length
    });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

