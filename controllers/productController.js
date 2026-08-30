const { readData, writeData } = require('../database/store');

// Product IDs that should always appear first, in display order
const PINNED_PRODUCT_IDS = ['prod_tank_1', 'prod_tank_6']; // HDPE 10L GOLD GAP, HDPE 6L GOLD GAP

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
