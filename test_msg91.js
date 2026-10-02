// MSG91 OTP test – sends one test OTP SMS using the SAME request the app uses
// (see controllers/authController.js -> sendOtp).
//
// Keys are read from backend/.env – never write the authkey in this file.
//   MSG91_AUTH_KEY=xxxxxxxx
//   MSG91_TEMPLATE_ID=xxxxxxxx
//
// Usage (run inside the backend folder):
//   node test_msg91.js 9876543210
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const https = require('https');

const MSG91_AUTH_KEY = (process.env.MSG91_AUTH_KEY || '').trim();
const MSG91_TEMPLATE_ID = (process.env.MSG91_TEMPLATE_ID || '').trim();

let mobile = (process.argv[2] || '').replace(/\D/g, '');
if (mobile.length === 10) mobile = `91${mobile}`;

const missing = [];
if (!MSG91_AUTH_KEY) missing.push('MSG91_AUTH_KEY');
if (!MSG91_TEMPLATE_ID) missing.push('MSG91_TEMPLATE_ID');
if (missing.length) {
  console.error(`❌ backend/.env me ye value nahi mili: ${missing.join(', ')}`);
  process.exit(1);
}
if (mobile.length !== 12) {
  console.error('❌ Mobile number do. Example:  node test_msg91.js 9876543210');
  process.exit(1);
}

const otp = Math.floor(100000 + Math.random() * 900000).toString();

const options = {
  hostname: 'control.msg91.com',
  path: `/api/v5/otp?template_id=${MSG91_TEMPLATE_ID}&mobile=${mobile}&otp=${otp}`,
  method: 'GET',
  headers: { authkey: MSG91_AUTH_KEY },
};

console.log(`Sending test OTP ${otp} to ${mobile} ...`);

const req = https.request(options, (msgRes) => {
  let body = '';
  msgRes.on('data', (chunk) => (body += chunk));
  msgRes.on('end', () => {
    console.log('[MSG91] HTTP status:', msgRes.statusCode);
    console.log('[MSG91] Response   :', body);
    try {
      const parsed = JSON.parse(body);
      if (parsed.type === 'success') {
        console.log(`\n✅ MSG91 ne request accept kar li. Phone pe SMS aana chahiye (OTP ${otp}).`);
        console.log('   SMS na aaye to MSG91 panel > SMS > Delivery / Failed Logs dekho (DLT template / sender ID issue hota hai).');
      } else {
        console.log('\n❌ MSG91 ne error diya:', parsed.message || body);
        if (String(parsed.code) === '418' || /418|whitelist/i.test(body)) {
          console.log('   → IP whitelisted nahi hai. MSG91 panel > Authkey > is key ka "IP security" OFF karo ya apna IP add karo.');
        }
        if (/auth/i.test(parsed.message || '')) {
          console.log('   → Authkey galat / disabled hai. .env me key dobara check karo (space ya quotes nahi hone chahiye).');
        }
        if (/template/i.test(parsed.message || '')) {
          console.log('   → Template ID galat hai ya template approve nahi hua.');
        }
      }
    } catch (e) {
      console.log('\n⚠️  Response JSON nahi hai – upar wala response dekho.');
    }
  });
});

req.on('error', (err) => console.error('[MSG91] Network error:', err.message));
req.end();