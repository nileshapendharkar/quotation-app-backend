const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/orders/my-orders?status=All',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer mock_jwt_token_7768807208',
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log('Response JSON:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.end();
