const { readData, writeData } = require('../database/store');

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await readData();
    const rawCart = data.carts[userId] || [];

    const cartItems = rawCart.map(item => {
      const product = data.products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        size: item.size || '',
        productName: product ? product.name : 'Unknown Product',
        image: product ? product.image : '',
        categoryName: product ? product.categoryName : '',
        sizes: product ? (product.sizes || []) : []
      };
    }).filter(item => item.productName !== 'Unknown Product');

    res.json({ success: true, cart: cartItems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, size } = req.body;
    const qty = parseInt(quantity) || 1;
    const itemSize = size || '';

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const data = await readData();
    if (!data.carts[userId]) {
      data.carts[userId] = [];
    }

    const existingIndex = data.carts[userId].findIndex(item => 
      item.productId === productId && 
      (item.size === itemSize || (!item.size && !itemSize))
    );

    if (existingIndex >= 0) {
      data.carts[userId][existingIndex].quantity += qty;
    } else {
      data.carts[userId].push({ productId, quantity: qty, size: itemSize });
    }

    await writeData(data);
    res.json({ success: true, message: 'Item added to quotation cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, size } = req.body;
    const qty = parseInt(quantity);
    const itemSize = size || '';

    const data = await readData();
    if (!data.carts[userId]) return res.json({ success: true, cart: [] });

    const item = data.carts[userId].find(i => 
      i.productId === productId && 
      (i.size === itemSize || (!i.size && !itemSize))
    );

    if (item) {
      if (qty <= 0) {
        data.carts[userId] = data.carts[userId].filter(i => 
          !(i.productId === productId && (i.size === itemSize || (!i.size && !itemSize)))
        );
      } else {
        item.quantity = qty;
      }
      await writeData(data);
    }

    res.json({ success: true, message: 'Quantity updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { size } = req.query;
    const itemSize = size || '';

    const data = await readData();
    if (data.carts[userId]) {
      data.carts[userId] = data.carts[userId].filter(i => 
        !(i.productId === productId && (i.size === itemSize || (!i.size && !itemSize)))
      );
      await writeData(data);
    }

    res.json({ success: true, message: 'Item removed from quotation cart' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await readData();
    data.carts[userId] = [];
    await writeData(data);
    res.json({ success: true, message: 'Quotation cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
