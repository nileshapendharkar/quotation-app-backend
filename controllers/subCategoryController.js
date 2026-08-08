const { readData, writeData } = require('../database/store');

exports.getAllSubCategories = (req, res) => {
  try {
    const data = readData();
    res.json({ success: true, subCategories: data.subCategories || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addSubCategory = (req, res) => {
  try {
    const { name, image, categoryId } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ success: false, message: 'Sub-Category name and categoryId are required' });
    }

    const data = readData();
    
    // Ensure category exists
    const cat = data.categories.find(c => c.id === categoryId);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Parent category not found' });
    }

    const newSubCategory = {
      id: 'subcat_' + Date.now(),
      name,
      categoryId,
      image: image || null
    };

    if (!data.subCategories) {
      data.subCategories = [];
    }
    
    data.subCategories.push(newSubCategory);
    writeData(data);

    res.status(201).json({ success: true, message: 'Sub-Category created', subCategory: newSubCategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSubCategory = (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, categoryId } = req.body;

    const data = readData();
    if (!data.subCategories) data.subCategories = [];
    
    const subCat = data.subCategories.find(c => c.id === id);
    if (!subCat) {
      return res.status(404).json({ success: false, message: 'Sub-Category not found' });
    }

    if (name) subCat.name = name;
    if (image !== undefined) subCat.image = image;
    if (categoryId) {
      const cat = data.categories.find(c => c.id === categoryId);
      if (!cat) {
        return res.status(404).json({ success: false, message: 'Parent category not found' });
      }
      subCat.categoryId = categoryId;
    }

    writeData(data);
    res.json({ success: true, message: 'Sub-Category updated', subCategory: subCat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSubCategory = (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    
    if (!data.subCategories) data.subCategories = [];

    const idx = data.subCategories.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Sub-Category not found' });
    }

    data.subCategories.splice(idx, 1);
    writeData(data);

    res.json({ success: true, message: 'Sub-Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
