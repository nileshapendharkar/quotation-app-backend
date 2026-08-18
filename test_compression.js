const http = require('http');
const zlib = require('zlib');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/products', // Assume this returns > 1KB data
  method: 'GET',
  headers: {
    'Accept-Encoding': 'gzip, deflate'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  const contentEncoding = res.headers['content-encoding'];
  console.log(`Content-Encoding: ${contentEncoding}`);
  
  let chunks = [];
  
  res.on('data', (chunk) => {
    chunks.push(chunk);
  });
  
  res.on('end', () => {
    const buffer = Buffer.concat(chunks);
    console.log(`Transfer Size (compressed): ${buffer.length} bytes`);
    
    if (contentEncoding === 'gzip') {
      zlib.gunzip(buffer, (err, decoded) => {
        if (err) {
          console.error('Error unzipping:', err);
          return;
        }
        console.log(`Uncompressed Size: ${decoded.length} bytes`);
        console.log(`Compression Ratio: ${((1 - (buffer.length / decoded.length)) * 100).toFixed(2)}%`);
        try {
          const parsed = JSON.parse(decoded.toString());
          console.log('Parsed JSON correctly: true. Keys:', Object.keys(parsed));
        } catch(e) {
          console.log('Parsed JSON correctly: false, error:', e.message);
        }
      });
    } else {
      console.log(`Uncompressed Size: ${buffer.length} bytes`);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
