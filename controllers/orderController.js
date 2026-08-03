const { readData, writeData } = require('../database/store');
const { generateQuotationPDF } = require('../utils/pdfGenerator');

exports.createOrder = (req, res) => {
  try {
    const userId = req.user.id;
    const { items, notes } = req.body;

    const data = readData();
    const user = data.users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let orderItems = [];
    if (items && Array.isArray(items) && items.length > 0) {
      orderItems = items.map(item => {
        const prod = data.products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: prod ? prod.name : 'Product ' + item.productId,
          quantity: item.quantity,
          image: prod ? prod.image : ''
        };
      });
    } else {
      // Use items from cart
      const userCart = data.carts[userId] || [];
      if (userCart.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty. Add products to request a quotation.' });
      }
      orderItems = userCart.map(item => {
        const prod = data.products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          productName: prod ? prod.name : 'Product ' + item.productId,
          quantity: item.quantity,
          image: prod ? prod.image : ''
        };
      });
    }

    const orderNumSeq = Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: 'ord_' + Date.now(),
      orderNo: `QT-2026-${orderNumSeq}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userMobile: user.mobile,
      companyName: user.companyName || 'Individual Customer',
      companyAddress: user.companyAddress || 'Not Provided',
      items: orderItems, // strictly Product Name + Quantity
      status: 'Pending', // Pending, Dispatched, Cancelled
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    data.orders.unshift(newOrder);
    data.carts[userId] = []; // Clear cart after quotation request
    writeData(data);

    res.status(201).json({
      success: true,
      message: 'Quotation request submitted successfully',
      order: newOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserOrders = (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    const data = readData();

    let orders = data.orders.filter(o => o.userId === userId);
    if (status && status !== 'All') {
      orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllOrders = (req, res) => {
  try {
    const { status } = req.query;
    const data = readData();

    let orders = [...data.orders];
    if (status && status !== 'All') {
      orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Dispatched', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Allowed: Pending, Dispatched, Cancelled' });
    }

    const data = readData();
    const order = data.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order / Quotation not found' });
    }

    order.status = status;
    writeData(data);

    res.json({ success: true, message: `Quotation status updated to ${status}`, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadQuotationPDF = (req, res) => {
  try {
    const { id } = req.params;
    const data = readData();
    const order = data.orders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Quotation request not found' });
    }

    generateQuotationPDF(order, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
