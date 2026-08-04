const { readData, writeData } = require('../database/store');

exports.getAllProducts = (req, res) => {
  try {
    const { categoryId, search } = req.query;
    const data = readData();
    let products = [...data.products];

    if (categoryId) {
      products = products.filter(p => p.categoryId === categoryId);
    }

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProductById = (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const product = data.products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addProduct = (req, res) => {
  try {
    const { name, image, categoryId, description, sizes } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ success: false, message: 'Product Name and Category are required' });
    }

    const data = readData();
    const category = data.categories.find(c => c.id === categoryId);

    const parsedSizes = Array.isArray(sizes) 
      ? sizes 
      : (sizes ? String(sizes).split(',').map(s => s.trim()).filter(Boolean) : []);

    const newProduct = {
      id: 'prod_' + Date.now(),
      name,
      categoryId,
      categoryName: category ? category.name : 'General',
      image: image || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&q=80',
      description: description || '',
      sizes: parsedSizes
    };

    data.products.push(newProduct);
    writeData(data);

    res.status(201).json({ success: true, message: 'Product created', product: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, categoryId, description, sizes } = req.body;

    const data = readData();
    const product = data.products.find(p => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (name) product.name = name;
    if (image) product.image = image;
    if (description !== undefined) product.description = description;
    if (sizes !== undefined) {
      product.sizes = Array.isArray(sizes) 
        ? sizes 
        : (sizes ? String(sizes).split(',').map(s => s.trim()).filter(Boolean) : []);
    }

    if (categoryId) {
      product.categoryId = categoryId;
      const cat = data.categories.find(c => c.id === categoryId);
      if (cat) product.categoryName = cat.name;
    }

    writeData(data);
    res.json({ success: true, message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const idx = data.products.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    data.products.splice(idx, 1);
    writeData(data);

    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
