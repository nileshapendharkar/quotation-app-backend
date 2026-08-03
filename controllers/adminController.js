const { readData, writeData } = require('../database/store');

exports.getDashboardStats = (req, res) => {
  try {
    const data = readData();

    const totalUsers = data.users.filter(u => u.role !== 'admin').length;
    const totalOrders = data.orders.length;
    const pendingOrders = data.orders.filter(o => o.status === 'Pending').length;
    const dispatchedOrders = data.orders.filter(o => o.status === 'Dispatched').length;
    const cancelledOrders = data.orders.filter(o => o.status === 'Cancelled').length;
    const totalProducts = data.products.length;
    const totalCategories = data.categories.length;

    const recentOrders = data.orders.slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        pendingOrders,
        dispatchedOrders,
        cancelledOrders,
        totalProducts,
        totalCategories
      },
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = (req, res) => {
  try {
    const data = readData();
    const customers = data.users
      .filter(u => u.role !== 'admin')
      .map(u => {
        const userCopy = { ...u };
        delete userCopy.passwordHash;
        return userCopy;
      });

    res.json({ success: true, users: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNotifications = (req, res) => {
  try {
    const data = readData();
    res.json({ success: true, notifications: data.notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendNotification = (req, res) => {
  try {
    const { title, message, targetUser } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const data = readData();
    const newNotif = {
      id: 'notif_' + Date.now(),
      title,
      message,
      targetUser: targetUser || 'all',
      createdAt: new Date().toISOString()
    };

    data.notifications.unshift(newNotif);
    writeData(data);

    res.status(201).json({ success: true, message: 'Notification broadcasted', notification: newNotif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
