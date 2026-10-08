const https = require('https');

function request(url, options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function runTest() {
  console.log('1. Logging in as Admin...');
  const loginRes = await request('https://quotation-app-backend-master.vercel.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { userId: 'Admin', password: 'GGi#4321' });

  console.log('Login status:', loginRes.status, 'Success:', loginRes.data?.success);
  if (!loginRes.data?.token) {
    throw new Error('No token received');
  }
  const token = loginRes.data.token;

  console.log('2. Fetching current users list...');
  const usersRes = await request('https://quotation-app-backend-master.vercel.app/api/admin/users', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`Current users count: ${usersRes.data?.users?.length}`);

  const testMobile = '9999988888';
  console.log(`3. Creating a test user (${testMobile})...`);
  const createRes = await request('https://quotation-app-backend-master.vercel.app/api/admin/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, {
    userId: testMobile,
    password: 'GGi#4321',
    name: 'Neon Sync Test User',
    companyName: 'Test Corp',
    companyAddress: 'Nagpur',
    status: 'Active'
  });
  console.log('Create user status:', createRes.status, createRes.data?.message);

  console.log('4. Re-fetching users from Vercel backend to verify persistence...');
  const usersRes2 = await request('https://quotation-app-backend-master.vercel.app/api/admin/users', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const found = usersRes2.data?.users?.find(u => u.userId === testMobile);
  if (found) {
    console.log(`✅ SUCCESS! User ${testMobile} found in backend. User count: ${usersRes2.data.users.length}`);
  } else {
    console.error('❌ User NOT found in backend!');
  }

  console.log('5. Testing mobile app login with created user...');
  const userLogin = await request('https://quotation-app-backend-master.vercel.app/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { userId: testMobile, password: 'GGi#4321' });
  console.log('User login status:', userLogin.status, 'Success:', userLogin.data?.success);

  console.log('6. Cleaning up test user...');
  if (found?.id) {
    await request(`https://quotation-app-backend-master.vercel.app/api/admin/users/${found.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Cleaned up test user.');
  }
}

runTest().catch(console.error);
