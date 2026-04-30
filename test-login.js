/**
 * Test script to verify login endpoint
 */

const http = require('http');

const postData = JSON.stringify({
  username: 'admin',
  password: 'Admin123!'
});

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing login endpoint...');
console.log('Credentials: admin / Admin123!');
console.log('');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  console.log('');
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
        
        if (parsed.success) {
          console.log('\n✅ LOGIN SUCCESSFUL!');
          console.log(`User: ${parsed.user.username}`);
          console.log(`Email: ${parsed.user.email}`);
          console.log(`Role: ${parsed.user.role}`);
        } else {
          console.log('\n❌ LOGIN FAILED');
        }
      } catch (e) {
        console.log('Raw response:', data);
        console.log('\n❌ INVALID JSON RESPONSE');
      }
    } else {
      console.log('(empty response)');
      console.log('\n❌ EMPTY RESPONSE - This is the problem!');
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(postData);
req.end();
