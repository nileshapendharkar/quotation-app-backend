const { readData, writeData } = require('../database/store');

exports.getDashboardStats = async (req, res) => {
  try {
    const data = await readData();

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

exports.getUsers = async (req, res) => {
  try {
    const data = await readData();
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

exports.createUser = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { userId, password, name, companyName, companyAddress } = req.body;

    const cleanUserId = (userId || '').toString().trim();
    const cleanPassword = (password || '').toString().trim();

    if (!cleanUserId || !cleanPassword) {
      return res.status(400).json({ success: false, message: 'User ID (Mobile Number) and Password are required' });
    }

    const data = await readData();
    const existing = data.users.find(u => 
      (u.userId && u.userId.toLowerCase() === cleanUserId.toLowerCase()) || 
      (u.mobile && u.mobile.toLowerCase() === cleanUserId.toLowerCase())
    );

    if (existing) {
      return res.status(400).json({ success: false, message: `User ID / Mobile ${cleanUserId} already exists` });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(cleanPassword, salt);

    const newUser = {
      id: 'usr_' + Date.now() + Math.floor(Math.random() * 1000),
      userId: cleanUserId,
      mobile: cleanUserId,
      name: name || `Customer (${cleanUserId})`,
      email: `${cleanUserId}@app.com`,
      plainPassword: cleanPassword,
      passwordHash,
      role: 'customer',
      status: 'Active',
      companyName: companyName || '',
      companyAddress: companyAddress || '',
      createdAt: new Date().toISOString()
    };

    data.users.push(newUser);
    if (!data.favorites) data.favorites = {};
    if (!data.carts) data.carts = {};
    data.favorites[newUser.id] = [];
    data.carts[newUser.id] = [];

    await writeData(data);

    const userResp = { ...newUser };
    delete userResp.passwordHash;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResp
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadExcelUsers = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { usersList } = req.body; // Expect array of { userId, password } objects

    if (!Array.isArray(usersList) || usersList.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid user data provided' });
    }

    const data = await readData();
    let addedCount = 0;
    let updatedCount = 0;

    for (const item of usersList) {
      const cleanUserId = (item.userId || item['User ID'] || item['UserId'] || item['Mobile'] || '').toString().trim();
      const cleanPassword = (item.password || item['Password'] || item['Pass'] || '').toString().trim();

      if (!cleanUserId || !cleanPassword) continue;

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(cleanPassword, salt);

      const existingIndex = data.users.findIndex(u => 
        (u.userId && u.userId.toLowerCase() === cleanUserId.toLowerCase()) || 
        (u.mobile && u.mobile.toLowerCase() === cleanUserId.toLowerCase())
      );

      if (existingIndex !== -1) {
        // Update existing user password
        data.users[existingIndex].plainPassword = cleanPassword;
        data.users[existingIndex].passwordHash = passwordHash;
        data.users[existingIndex].status = 'Active';
        updatedCount++;
      } else {
        // Create new user
        const newUser = {
          id: 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
          userId: cleanUserId,
          mobile: cleanUserId,
          name: `Customer (${cleanUserId})`,
          email: `${cleanUserId}@app.com`,
          plainPassword: cleanPassword,
          passwordHash,
          role: 'customer',
          status: 'Active',
          companyName: '',
          companyAddress: '',
          createdAt: new Date().toISOString()
        };
        data.users.push(newUser);
        if (!data.favorites) data.favorites = {};
        if (!data.carts) data.carts = {};
        data.favorites[newUser.id] = [];
        data.carts[newUser.id] = [];
        addedCount++;
      }
    }

    await writeData(data);

    res.json({
      success: true,
      message: `Excel import complete! ${addedCount} new users created, ${updatedCount} existing users updated.`,
      addedCount,
      updatedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { id } = req.params;
    const { password, name, status, companyName } = req.body;

    const data = await readData();
    const user = data.users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (password) {
      const cleanPassword = password.toString().trim();
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(cleanPassword, salt);
      user.plainPassword = cleanPassword;
    }

    if (name) user.name = name;
    if (status) user.status = status;
    if (companyName !== undefined) user.companyName = companyName;

    await writeData(data);

    const userResp = { ...user };
    delete userResp.passwordHash;

    res.json({ success: true, message: 'User updated successfully', user: userResp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readData();

    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (data.users[index].role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin account cannot be deleted' });
    }

    data.users.splice(index, 1);
    if (data.favorites) delete data.favorites[id];
    if (data.carts) delete data.carts[id];

    await writeData(data);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const data = await readData();
    res.json({ success: true, notifications: data.notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const { title, message, targetUser } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const data = await readData();
    const newNotif = {
      id: 'notif_' + Date.now(),
      title,
      message,
      targetUser: targetUser || 'all',
      createdAt: new Date().toISOString()
    };

    data.notifications.unshift(newNotif);
    await writeData(data);

    res.status(201).json({ success: true, message: 'Notification broadcasted', notification: newNotif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

