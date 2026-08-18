const { readData, writeData } = require('../database/store');

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await readData();
    const favIds = data.favorites[userId] || [];

    const favoriteProducts = data.products.filter(p => favIds.includes(p.id));
    res.json({ success: true, favorites: favoriteProducts, favoriteIds: favIds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const data = await readData();
    if (!data.favorites[userId]) {
      data.favorites[userId] = [];
    }

    const index = data.favorites[userId].indexOf(productId);
    let isFavorite = false;

    if (index >= 0) {
      data.favorites[userId].splice(index, 1);
      isFavorite = false;
    } else {
      data.favorites[userId].push(productId);
      isFavorite = true;
    }

    await writeData(data);

    res.json({
      success: true,
      message: isFavorite ? 'Added to favorites' : 'Removed from favorites',
      isFavorite,
      favoriteIds: data.favorites[userId]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
