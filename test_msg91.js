const https = require('https');

const MSG91_AUTH_KEY = '563882AGq16MsfTEpD6a8c1566P1';
const MSG91_TEMPLATE_ID = '6a8c1a14129ac89dd5062993';
const mobile = '919225087140'; // Replace with a test number if needed
const otp = '123456';

const url = `https://control.msg91.com/api/v5/otp?template_id=${MSG91_TEMPLATE_ID}&mobile=${mobile}&authkey=${MSG91_AUTH_KEY}&otp=${otp}`;

https.get(url, (msgRes) => {
  let responseData = '';
  msgRes.on('data', chunk => responseData += chunk);
  msgRes.on('end', () => {
    console.log(`[MSG91] Response Status:`, msgRes.statusCode);
    console.log(`[MSG91] Response Data:`, responseData);
  });
}).on('error', (err) => {
  console.error(`[MSG91] Error:`, err.message);
});
