const { readData, writeData } = require('../database/store');

exports.getCart = (req, res) => {
  try {
    const userId = req.user.id;
    const data = readData();
    const rawCart = data.carts[userId] || [];

    const cartItems = rawCart.map(item => {
      const product = data.products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        productName: product ? product.name : 'Unknown Product',
        image: product ? product.image : '',
        categoryName: product ? product.categoryName : ''
      };
    }).filter(item => item.productName !== 'Unknown Product');

    res.json({ success: true, cart: cartItems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addToCart = (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity) || 1;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const data = readData();
    if (!data.carts[userId]) {
      data.carts[userId] = [];
    }

    const existingIndex = data.carts[userId].findIndex(item => item.productId === productId);
    if (existingIndex >= 0) {
      data.carts[userId][existingIndex].quantity += qty;
    } else {
      data.carts[userId].push({ productId, quantity: qty });
    }

    writeData(data);
    res.json({ success: true, message: 'Item added to quotation cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateQuantity = (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    const qty = parseInt(quantity);

    const data = readData();
    if (!data.carts[userId]) return res.json({ success: true, cart: [] });

    const item = data.carts[userId].find(i => i.productId === productId);
    if (item) {
      if (qty <= 0) {
        data.carts[userId] = data.carts[userId].filter(i => i.productId !== productId);
      } else {
        item.quantity = qty;
      }
      writeData(data);
    }

    res.json({ success: true, message: 'Quantity updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFromCart = (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const data = readData();
    if (data.carts[userId]) {
      data.carts[userId] = data.carts[userId].filter(i => i.productId !== productId);
      writeData(data);
    }

    res.json({ success: true, message: 'Item removed from quotation cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.clearCart = (req, res) => {
  try {
    const userId = req.user.id;
    const data = readData();
    data.carts[userId] = [];
    writeData(data);
    res.json({ success: true, message: 'Quotation cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
