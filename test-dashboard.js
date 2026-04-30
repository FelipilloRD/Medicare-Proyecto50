/**
 * Test script to verify dashboard endpoint
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
  console.log('TESTING DASHBOARD ENDPOINT');
  console.log('='.repeat(60));

  // Step 1: Login as admin
  console.log('\nStep 1: Logging in as admin...');
  const loginRes = await request({
    hostname: 'localhost', port: 3002, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ username: 'admin', password: 'Admin123!' }));

  if (loginRes.status !== 200) {
    console.log('❌ Login failed:', loginRes.body);
    process.exit(1);
  }
  console.log('✅ Login successful');

  // Step 2: Get dashboard data
  console.log('\nStep 2: Fetching dashboard data...');
  const dashboardRes = await request({
    hostname: 'localhost', port: 3002, path: '/api/admin/dashboard?days=30', method: 'GET'
  });

  console.log(`Status Code: ${dashboardRes.status}`);
  if (dashboardRes.status !== 200) {
    console.log('❌ Dashboard fetch failed:', dashboardRes.body);
    process.exit(1);
  }

  const dashboardData = JSON.parse(dashboardRes.body);
  console.log('\n✅ DASHBOARD DATA:');
  console.log('─'.repeat(60));
  console.log('Summary:');
  console.log(`  Total Appointments: ${dashboardData.summary.totalAppointments}`);
  console.log(`  Total Reminders: ${dashboardData.summary.totalReminders}`);
  console.log(`  Sent Reminders: ${dashboardData.summary.sentReminders}`);
  console.log(`  Pending Reminders: ${dashboardData.summary.pendingReminders}`);
  console.log(`\nCharts:`);
  console.log(`  Confirmation Rate: ${dashboardData.charts.confirmationRate}%`);
  console.log(`  Reminder Delivery Rate: ${dashboardData.charts.reminderDeliveryRate}%`);
  console.log(`  Service Stats: ${dashboardData.charts.serviceStats.length} services`);
  console.log(`\nLists:`);
  console.log(`  Upcoming Appointments: ${dashboardData.lists.upcomingAppointments.length}`);
  console.log(`  Recent Appointments: ${dashboardData.lists.recentAppointments.length}`);
  console.log('─'.repeat(60));
  console.log('\n✅ ALL TESTS PASSED!');
}

runTest().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
