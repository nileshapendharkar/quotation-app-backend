const { readData, writeData } = require('../database/store');

exports.getAllCategories = (req, res) => {
  try {
    const data = readData();
    res.json({ success: true, categories: data.categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addCategory = (req, res) => {
  try {
    const { name, image, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const data = readData();
    const newCategory = {
      id: 'cat_' + Date.now(),
      name,
      image: image || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&q=80',
      description: description || ''
    };

    data.categories.push(newCategory);
    writeData(data);

    res.status(201).json({ success: true, message: 'Category created', category: newCategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCategory = (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, description } = req.body;

    const data = readData();
    const cat = data.categories.find(c => c.id === id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name) cat.name = name;
    if (image) cat.image = image;
    if (description !== undefined) cat.description = description;

    writeData(data);
    res.json({ success: true, message: 'Category updated', category: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCategory = (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();

    const idx = data.categories.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    data.categories.splice(idx, 1);
    writeData(data);

    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
