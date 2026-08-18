const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readData, writeData } = require('../database/store');
const { JWT_SECRET } = require('../middleware/authMiddleware');

exports.register = async (req, res) => {
  try {
    const { name, email, mobile, password, companyName, companyAddress } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ success: false, message: 'Name, Email, Mobile and Password are required' });
    }

    const data = await readData();
    const existing = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email: email.toLowerCase(),
      mobile,
      passwordHash,
      role: 'customer',
      companyName: companyName || '',
      companyAddress: companyAddress || '',
      createdAt: new Date().toISOString()
    };

    data.users.push(newUser);
    data.favorites[newUser.id] = [];
    data.carts[newUser.id] = [];
    await writeData(data);

    const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: '30d' });

    const userResp = { ...newUser };
    delete userResp.passwordHash;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userResp
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { userId, mobile, email, password } = req.body;
    const loginIdentifier = (userId || mobile || email || '').toString().trim().toLowerCase();
    const rawPassword = (password || '').toString().trim();

    if (!loginIdentifier || !rawPassword) {
      return res.status(400).json({ success: false, message: 'User ID / Mobile Number and Password are required' });
    }

    const data = await readData();
    const user = data.users.find(u => {
      const uUserId = (u.userId || '').toString().trim().toLowerCase();
      const uMobile = (u.mobile || '').toString().trim().toLowerCase();
      const uEmail = (u.email || '').toString().trim().toLowerCase();
      return uUserId === loginIdentifier || uMobile === loginIdentifier || uEmail === loginIdentifier;
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid User ID / Mobile Number or Password. Only admin-approved accounts can log in.' });
    }

    if (user.status === 'Inactive' || user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account is currently inactive. Please contact admin.' });
    }

    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await bcrypt.compare(rawPassword, user.passwordHash);
    }
    if (!isMatch && user.plainPassword && user.plainPassword === rawPassword) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid User ID / Mobile Number or Password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, userId: user.userId || user.mobile || user.email }, JWT_SECRET, { expiresIn: '30d' });

    const userResp = { ...user };
    delete userResp.passwordHash;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResp
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const data = await readData();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    res.json({
      success: true,
      message: 'Password reset instructions sent to your email.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }

    const data = await readData();
    const user = data.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await writeData(data);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const data = await readData();
    const user = data.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userResp = { ...user };
    delete userResp.passwordHash;

    res.json({ success: true, user: userResp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, mobile, companyName, companyAddress } = req.body;
    const data = await readData();
    const user = data.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    if (companyName !== undefined) user.companyName = companyName;
    if (companyAddress !== undefined) user.companyAddress = companyAddress;

    await writeData(data);

    const userResp = { ...user };
    delete userResp.passwordHash;

    res.json({ success: true, message: 'Profile updated', user: userResp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const data = await readData();
    const index = data.users.findIndex(u => u.id === req.user.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    data.users.splice(index, 1);
    delete data.favorites[req.user.id];
    delete data.carts[req.user.id];
    await writeData(data);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
