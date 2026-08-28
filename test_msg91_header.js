const https = require('https');

const MSG91_AUTH_KEY = '563882AGq16MsfTEpD6a8c1566P1';
const MSG91_TEMPLATE_ID = '6a8c1a14129ac89dd5062993';
const mobile = '919225087140'; // Replace with a test number if needed
const otp = '123456';

const options = {
  hostname: 'control.msg91.com',
  path: `/api/v5/otp?template_id=${MSG91_TEMPLATE_ID}&mobile=${mobile}&otp=${otp}`,
  method: 'GET',
  headers: {
    'authkey': MSG91_AUTH_KEY
  }
};

const req = https.request(options, (msgRes) => {
  let responseData = '';
  msgRes.on('data', chunk => responseData += chunk);
  msgRes.on('end', () => {
    console.log(`[MSG91] Response Status:`, msgRes.statusCode);
    console.log(`[MSG91] Response Data:`, responseData);
  });
});

req.on('error', (err) => {
  console.error(`[MSG91] Error:`, err.message);
});

req.end();
