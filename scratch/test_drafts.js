const http = require('http');

const API_BASE = 'http://localhost:5000/api';

function makeRequest(url, method, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Starting Drafts Backend API Integration Tests ===');

  try {
    // 1. Send OTP
    console.log('\n[Test 1] Requesting OTP for 9225087140...');
    const otpRes = await makeRequest(`${API_BASE}/auth/send-otp`, 'POST', { mobile: '9225087140' });
    console.log('OTP Response:', otpRes);

    if (!otpRes.success) {
      throw new Error('Failed to send OTP');
    }

    const otpToken = otpRes.otpToken;

    // 2. Login
    console.log('\n[Test 2] Logging in with OTP 123456...');
    const loginRes = await makeRequest(`${API_BASE}/auth/login`, 'POST', {
      mobile: '9225087140',
      password: '123456',
      otpToken: otpToken
    });
    console.log('Login Response:', { success: loginRes.success, message: loginRes.message, user: loginRes.user ? loginRes.user.name : null });

    if (!loginRes.success) {
      throw new Error('Failed to log in');
    }

    const token = loginRes.token;

    // 3. Save Draft
    console.log('\n[Test 3] Saving a new Draft...');
    const draftItems = [
      { productId: 'prod_tank_1', quantity: 3, size: '500L' },
      { productId: 'prod_tank_6', quantity: 2, size: '1000L' }
    ];
    const saveRes = await makeRequest(`${API_BASE}/drafts/save`, 'POST', {
      items: draftItems,
      notes: 'Test draft quotation notes'
    }, token);
    console.log('Save Draft Response:', saveRes);

    if (!saveRes.success || !saveRes.draft) {
      throw new Error('Failed to save draft');
    }

    const draftId = saveRes.draft.id;
    const draftNo = saveRes.draft.draftNo;

    // 4. List Drafts
    console.log('\n[Test 4] Listing my drafts...');
    const listRes = await makeRequest(`${API_BASE}/drafts/my-drafts`, 'GET', null, token);
    console.log('List Drafts Response:', {
      success: listRes.success,
      count: listRes.drafts ? listRes.drafts.length : 0,
      drafts: listRes.drafts ? listRes.drafts.map(d => ({ id: d.id, draftNo: d.draftNo, itemsCount: d.items.length })) : []
    });

    if (!listRes.success) {
      throw new Error('Failed to list drafts');
    }

    // 5. Get Draft Detail
    console.log(`\n[Test 5] Fetching draft details for ${draftNo} (${draftId})...`);
    const detailRes = await makeRequest(`${API_BASE}/drafts/${draftId}`, 'GET', null, token);
    console.log('Draft Detail Response:', {
      success: detailRes.success,
      draftNo: detailRes.draft ? detailRes.draft.draftNo : null,
      items: detailRes.draft ? detailRes.draft.items : []
    });

    if (!detailRes.success) {
      throw new Error('Failed to get draft details');
    }

    // 6. Update Draft
    console.log(`\n[Test 6] Updating Draft ${draftNo} (${draftId})...`);
    const updatedItems = [
      { productId: 'prod_tank_1', quantity: 5, size: '500L' }
    ];
    const updateRes = await makeRequest(`${API_BASE}/drafts/save`, 'POST', {
      id: draftId,
      items: updatedItems,
      notes: 'Updated draft notes'
    }, token);
    console.log('Update Draft Response:', updateRes);

    if (!updateRes.success) {
      throw new Error('Failed to update draft');
    }

    // 7. Delete Draft
    console.log(`\n[Test 7] Deleting Draft ${draftNo} (${draftId})...`);
    const deleteRes = await makeRequest(`${API_BASE}/drafts/${draftId}`, 'DELETE', null, token);
    console.log('Delete Draft Response:', deleteRes);

    if (!deleteRes.success) {
      throw new Error('Failed to delete draft');
    }

    console.log('\n=== All Drafts API Integration Tests Passed Successfully! ===');
  } catch (err) {
    console.error('\n❌ Test execution failed:', err.message);
  }
}

runTests();
