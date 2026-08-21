const { readData, writeData } = require('../database/store');
const { generateQuotationPDF } = require('../utils/pdfGenerator');
const XLSX = require('xlsx');

const findSizeKey = (sizeMap, querySize) => {
  if (!sizeMap || !querySize) return null;
  const normalizedQuery = String(querySize).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Try exact match first
  for (const key of Object.keys(sizeMap)) {
    if (key.toLowerCase() === querySize.toLowerCase()) return key;
  }
  
  // Try normalized match (e.g. "500l" vs "500l")
  for (const key of Object.keys(sizeMap)) {
    const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normKey === normalizedQuery) return key;
  }
  
  // Try matching digits only (e.g. "500" vs "500L")
  const digitsQuery = normalizedQuery.replace(/[^0-9]/g, '');
  if (digitsQuery) {
    for (const key of Object.keys(sizeMap)) {
      const digitsKey = key.toLowerCase().replace(/[^0-9]/g, '');
      if (digitsKey === digitsQuery) return key;
    }
  }
  
  return null;
};

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, notes } = req.body;

    const data = await readData();
    const user = data.users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let orderItems = [];
    if (items && Array.isArray(items) && items.length > 0) {
      orderItems = items.map(item => {
        const prod = data.products.find(p => p.id === item.productId);
        const matchedSizeKey = prod && prod.sizeProductCodes ? findSizeKey(prod.sizeProductCodes, item.size) : null;
        const matchedPackKey = prod && prod.packSizes ? findSizeKey(prod.packSizes, item.size) : null;

        return {
          productId: item.productId,
          productName: prod ? prod.name : 'Product ' + item.productId,
          productCode: matchedSizeKey ? (prod.sizeProductCodes[matchedSizeKey] || '') : '',
          size: matchedSizeKey || item.size || '',
          packing: matchedPackKey ? (prod.packSizes[matchedPackKey] || '') : (prod ? (prod.packing || prod.packSize || '') : ''),
          quantity: item.quantity,
          image: prod ? prod.image : '',
          categoryName: prod ? prod.categoryName : '',
          uom: prod ? prod.uom : 'Nos'
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
        const matchedSizeKey = prod && prod.sizeProductCodes ? findSizeKey(prod.sizeProductCodes, item.size) : null;
        const matchedPackKey = prod && prod.packSizes ? findSizeKey(prod.packSizes, item.size) : null;

        return {
          productId: item.productId,
          productName: prod ? prod.name : 'Product ' + item.productId,
          productCode: matchedSizeKey ? (prod.sizeProductCodes[matchedSizeKey] || '') : '',
          size: matchedSizeKey || item.size || '',
          packing: matchedPackKey ? (prod.packSizes[matchedPackKey] || '') : (prod ? (prod.packing || prod.packSize || '') : ''),
          quantity: item.quantity,
          image: prod ? prod.image : '',
          categoryName: prod ? prod.categoryName : '',
          uom: prod ? prod.uom : 'Nos'
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
    await writeData(data);

    res.status(201).json({
      success: true,
      message: 'Quotation request submitted successfully',
      order: newOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    const data = await readData();

    let orders = data.orders.filter(o => o.userId === userId);
    if (status && status !== 'All') {
      orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const data = await readData();

    let orders = [...data.orders];
    if (status && status !== 'All') {
      orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Dispatched', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Allowed: Pending, Dispatched, Cancelled' });
    }

    const data = await readData();
    const order = data.orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order / Quotation not found' });
    }

    order.status = status;
    await writeData(data);

    res.json({ success: true, message: `Quotation status updated to ${status}`, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadQuotationPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readData();
    const order = data.orders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Quotation request not found' });
    }

    // Inject uom and total into items for PDF generation
    order.items = order.items.map(item => {
      const prod = data.products.find(p => p.id === item.productId);
      const uom = item.uom || (prod ? prod.uom : 'Nos');
      const categoryName = item.categoryName || (prod ? prod.categoryName : '');
      
      let total = 0;
      if (categoryName.toLowerCase().includes('tank')) {
        const parsedSize = parseFloat(item.size);
        if (!isNaN(parsedSize)) total = parsedSize * item.quantity;
      } else {
        const parsedPacking = parseFloat(item.packing);
        if (!isNaN(parsedPacking)) total = parsedPacking * item.quantity;
      }

      return { ...item, uom, total };
    });

    generateQuotationPDF(order, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadQuotationExcel = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readData();
    const order = data.orders.find(o => o.id === id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Quotation request not found' });
    }

    const wb = XLSX.utils.book_new();

    const rows = [
      ["GOURI AQUA PLAST"],
      ["Ganesh Gouri Industries Pvt. Ltd."],
      ["Product Quantity Quotation Document | Water Tanks, Pipes & Fittings"],
      [],
      ["QUOTATION DETAILS"],
      ["Quotation No:", order.orderNo],
      ["Date:", new Date(order.createdAt).toLocaleDateString()],
      ["Status:", order.status],
      [],
      ["CUSTOMER & COMPANY DETAILS"],
      ["Customer Name:", order.userName],
      ["Email Address:", order.userEmail],
      ["Mobile Number:", order.userMobile],
      ["Company:", order.companyName || 'N/A'],
      ["Address:", order.companyAddress || 'N/A'],
      [],
      ["PRODUCT DETAILS"],
      ["ProductCode", "Product Name", "Size", "Packing", "Quantity", "UOM", "Total"]
    ];

    order.items.forEach(item => {
      const prod = data.products.find(p => p.id === item.productId);
      const uom = item.uom || (prod ? prod.uom : 'Nos');
      const categoryName = item.categoryName || (prod ? prod.categoryName : '');

      let total = 0;
      if (categoryName.toLowerCase().includes('tank')) {
        const parsedSize = parseFloat(item.size);
        if (!isNaN(parsedSize)) total = parsedSize * item.quantity;
      } else {
        const parsedPacking = parseFloat(item.packing);
        if (!isNaN(parsedPacking)) total = parsedPacking * item.quantity;
      }

      rows.push([
        item.productCode || '—',
        item.productName,
        item.size || '—',
        item.packing || '—',
        item.quantity,
        uom,
        total || '—'
      ]);
    });

    if (order.notes) {
      rows.push([]);
      rows.push(["Special Notes / Instructions:"]);
      rows.push([order.notes]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);

    const wscols = [
      { wch: 18 }, // ProductCode
      { wch: 35 }, // Product Name
      { wch: 12 }, // Size
      { wch: 12 }, // Packing
      { wch: 12 }, // Quantity
      { wch: 10 }, // UOM
      { wch: 12 }  // Total
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, "Quotation");

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Quotation_${order.orderNo}.xlsx`);
    res.send(buf);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

