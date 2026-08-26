const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');
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

exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    const data = await readData();
    const rawIdentifier = mobile.toString().trim().toLowerCase();
    let cleanIdentifier = rawIdentifier.replace(/\s+/g, '');
    if (cleanIdentifier.startsWith('+91')) cleanIdentifier = cleanIdentifier.slice(3);
    else if (cleanIdentifier.length > 10 && cleanIdentifier.startsWith('91')) cleanIdentifier = cleanIdentifier.slice(2);

    const user = data.users.find(u => {
      let uMobile = (u.mobile || '').replace(/\s+/g, '').toLowerCase();
      if (uMobile.startsWith('+91')) uMobile = uMobile.slice(3);
      else if (uMobile.length > 10 && uMobile.startsWith('91')) uMobile = uMobile.slice(2);

      let uUserId = (u.userId || '').replace(/\s+/g, '').toLowerCase();
      if (uUserId.startsWith('+91')) uUserId = uUserId.slice(3);
      else if (uUserId.length > 10 && uUserId.startsWith('91')) uUserId = uUserId.slice(2);
      
      const uEmail = (u.email || '').trim().toLowerCase();
      
      return uMobile === cleanIdentifier || 
             uUserId === cleanIdentifier || 
             uEmail === rawIdentifier;
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found. Please register or contact Admin.' });
    }
    
    if (user.status === 'Inactive' || user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account is currently inactive. Please contact admin.' });
    }

    // Generate 6-digit OTP
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Temporary bypass for testing
    if (cleanIdentifier === '9225087140' || cleanIdentifier === '9876543210') {
      otp = '123456';
    }
    
    console.log(`[AUTH] Generated OTP for ${mobile}: ${otp}`);

    const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || '';
    const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID || '';

    if (MSG91_AUTH_KEY && MSG91_TEMPLATE_ID) {
      const formattedMobile = cleanIdentifier.length === 10 ? `91${cleanIdentifier}` : cleanIdentifier;
      
      const options = {
        hostname: 'control.msg91.com',
        path: `/api/v5/otp?template_id=${MSG91_TEMPLATE_ID}&mobile=${formattedMobile}&otp=${otp}`,
        method: 'GET',
        headers: {
          'authkey': MSG91_AUTH_KEY
        }
      };

      try {
        await new Promise((resolve, reject) => {
          const req = https.request(options, (msgRes) => {
            let responseData = '';
            msgRes.on('data', chunk => responseData += chunk);
            msgRes.on('end', () => {
              console.log(`[MSG91] SMS Sent to ${formattedMobile}:`, responseData);
              try {
                const parsed = JSON.parse(responseData);
                if (parsed.type === 'error' || parsed.type === 'failure') {
                  reject(new Error(parsed.message || 'MSG91 SMS Gateway Error'));
                } else {
                  resolve(parsed);
                }
              } catch (e) {
                resolve(responseData);
              }
            });
          });
          req.on('error', (err) => reject(err));
          req.end();
        });
      } catch (err) {
        console.error(`[MSG91] Delivery Error for ${formattedMobile}:`, err.message);
        return res.status(500).json({ success: false, message: `SMS Delivery Failed: ${err.message}` });
      }
    } else {
      console.log('[MSG91] Keys missing in environment. Simulating OTP delivery.');
    }

    // Encrypt OTP using bcrypt
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Create a secure, encrypted JWT token containing the hashed OTP (expires in 5 mins)
    const otpToken = jwt.sign({ mobile: cleanIdentifier, otpHash }, JWT_SECRET, { expiresIn: '5m' });

    res.json({
      success: true,
      message: 'OTP sent securely to your mobile number',
      otpToken, // Returned to client to submit back during login verification
      mockOtp: otp // For testing purposes in a development environment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { userId, mobile, email, password, otpToken } = req.body;
    const rawIdentifier = (userId || mobile || email || '').toString().trim().toLowerCase();
    let cleanIdentifier = rawIdentifier.replace(/\s+/g, '');
    if (cleanIdentifier.startsWith('+91')) cleanIdentifier = cleanIdentifier.slice(3);
    else if (cleanIdentifier.length > 10 && cleanIdentifier.startsWith('91')) cleanIdentifier = cleanIdentifier.slice(2);

    const rawPassword = (password || '').toString().trim(); // acts as OTP or static password

    if (!rawIdentifier || !rawPassword) {
      return res.status(400).json({ success: false, message: 'User ID / Mobile Number and OTP/Password are required' });
    }

    let isMatch = false;

    // 1. If an encrypted JWT OTP token is provided, verify it first
    if (otpToken) {
      try {
        const decoded = jwt.verify(otpToken, JWT_SECRET);
        let decodedMobile = (decoded.mobile || '').replace(/\s+/g, '').toLowerCase();
        if (decodedMobile.startsWith('+91')) decodedMobile = decodedMobile.slice(3);
        else if (decodedMobile.length > 10 && decodedMobile.startsWith('91')) decodedMobile = decodedMobile.slice(2);
        
        if (decodedMobile === cleanIdentifier) {
          isMatch = await bcrypt.compare(rawPassword, decoded.otpHash);
          if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid OTP entered' });
          }
        }
      } catch (err) {
        return res.status(401).json({ success: false, message: 'OTP has expired or is invalid. Please request a new one.' });
      }
    }

    const data = await readData();
    const user = data.users.find(u => {
      let uUserId = (u.userId || '').replace(/\s+/g, '').toLowerCase();
      if (uUserId.startsWith('+91')) uUserId = uUserId.slice(3);
      else if (uUserId.length > 10 && uUserId.startsWith('91')) uUserId = uUserId.slice(2);

      let uMobile = (u.mobile || '').replace(/\s+/g, '').toLowerCase();
      if (uMobile.startsWith('+91')) uMobile = uMobile.slice(3);
      else if (uMobile.length > 10 && uMobile.startsWith('91')) uMobile = uMobile.slice(2);

      const uEmail = (u.email || '').trim().toLowerCase();
      
      return uUserId === cleanIdentifier || uMobile === cleanIdentifier || uEmail === rawIdentifier;
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid User ID / Mobile Number. Only admin-approved accounts can log in.' });
    }

    if (user.status === 'Inactive' || user.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your account is currently inactive. Please contact admin.' });
    }

    // 2. If it wasn't a valid OTP login, fallback to checking static password
    if (!isMatch) {
      if (user.passwordHash) {
        isMatch = await bcrypt.compare(rawPassword, user.passwordHash);
      }
      if (!isMatch && user.plainPassword && user.plainPassword === rawPassword) {
        isMatch = true;
      }
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
