/**
 * Test script to verify chat endpoint with CSRF token
 * Uses a simple cookie jar to properly handle all cookies across requests
 */

const http = require('http');

// Simple cookie jar
const cookieJar = {};

function parseCookies(setCookieHeaders) {
  if (!setCookieHeaders) return;
  const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  headers.forEach(header => {
    const parts = header.split(';');
    const [name, value] = parts[0].split('=');
    cookieJar[name.trim()] = value ? value.trim() : '';
  });
}

function getCookieHeader() {
  return Object.entries(cookieJar)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

function request(options, postData) {
  return new Promise((resolve, reject) => {
    options.headers = options.headers || {};
    options.headers['Cookie'] = getCookieHeader();
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      parseCookies(res.headers['set-cookie']);
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTest() {
  console.log('='.repeat(60));
  console.log('TESTING CHAT ENDPOINT WITH CSRF TOKEN');
  console.log('='.repeat(60));

  // Step 1: Login
  console.log('\nStep 1: Logging in...');
  const loginRes = await request({
    hostname: 'localhost', port: 3002, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ username: 'admin', password: 'Admin123!' }));

  if (loginRes.status !== 200) {
    console.log('❌ Login failed:', loginRes.body);
    process.exit(1);
  }
  console.log('✅ Login successful');

  // Step 2: Get CSRF token
  console.log('\nStep 2: Getting CSRF token...');
  const csrfRes = await request({
    hostname: 'localhost', port: 3002, path: '/api/auth/csrf-token', method: 'GET'
  });

  if (csrfRes.status !== 200) {
    console.log('❌ Failed to get CSRF token:', csrfRes.body);
    process.exit(1);
  }
  const { csrfToken } = JSON.parse(csrfRes.body);
  console.log('✅ CSRF token obtained:', csrfToken.substring(0, 20) + '...');
  console.log('Cookies in jar:', Object.keys(cookieJar).join(', '));

  // Step 3: Send chat message
  console.log('\nStep 3: Sending chat message...');
  const chatRes = await request({
    hostname: 'localhost', port: 3002, path: '/api/chat', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }
  }, JSON.stringify({ message: 'Hola, ¿qué servicios ofrecen?', lang: 'es' }));

  console.log(`Status Code: ${chatRes.status}`);
  if (chatRes.status !== 200) {
    console.log('❌ Chat failed:', chatRes.body);
    process.exit(1);
  }

  const chatData = JSON.parse(chatRes.body);
  console.log('\n✅ CHAT RESPONSE:');
  console.log('─'.repeat(60));
  console.log(chatData.response);
  console.log('─'.repeat(60));
  console.log('\n✅ ALL TESTS PASSED!');
}

runTest().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
