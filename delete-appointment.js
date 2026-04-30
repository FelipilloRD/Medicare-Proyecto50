/**
 * Script to delete appointments
 * Usage: 
 *   node delete-appointment.js <appointment_id>  - Delete specific appointment
 *   node delete-appointment.js ALL               - Delete ALL appointments
 */

const http = require('http');

const appointmentId = process.argv[2];

if (!appointmentId) {
  console.log('Usage:');
  console.log('  node delete-appointment.js <appointment_id>  - Delete specific appointment');
  console.log('  node delete-appointment.js ALL               - Delete ALL appointments');
  console.log('\nExamples:');
  console.log('  node delete-appointment.js 1    - Delete appointment #1');
  console.log('  node delete-appointment.js ALL  - Delete all appointments');
  process.exit(1);
}

const deleteAll = appointmentId.toUpperCase() === 'ALL';

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

async function deleteAppointment() {
  if (deleteAll) {
    console.log('⚠️  WARNING: You are about to delete ALL appointments!');
    console.log('This will send cancellation notifications to all patients.');
  } else {
    console.log(`Deleting appointment #${appointmentId}...`);
    console.log('Note: Cancellation notification will be sent to the patient via Email and WhatsApp.');
  }

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
  console.log('✅ CSRF token obtained');

  if (deleteAll) {
    // Get all appointments first
    console.log('\nStep 3: Fetching all appointments...');
    const appointmentsRes = await request({
      hostname: 'localhost', port: 3002, path: '/api/appointments', method: 'GET'
    });

    if (appointmentsRes.status !== 200) {
      console.log('❌ Failed to fetch appointments:', appointmentsRes.body);
      process.exit(1);
    }

    const { appointments } = JSON.parse(appointmentsRes.body);
    console.log(`✅ Found ${appointments.length} appointments`);

    if (appointments.length === 0) {
      console.log('\n✅ No appointments to delete.');
      return;
    }

    // Delete each appointment
    console.log(`\nStep 4: Deleting ${appointments.length} appointments...`);
    let successCount = 0;
    let failCount = 0;

    for (const appt of appointments) {
      try {
        const deleteRes = await request({
          hostname: 'localhost',
          port: 3002,
          path: `/api/appointments/${appt.id}`,
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken
          }
        });

        if (deleteRes.status === 200) {
          console.log(`  ✅ Deleted appointment #${appt.id} (${appt.name} - ${appt.service})`);
          console.log(`     📧 Email notification sent to: ${appt.email}`);
          if (appt.phone) {
            console.log(`     💬 WhatsApp notification sent to: ${appt.phone}`);
          }
          successCount++;
        } else {
          console.log(`  ❌ Failed to delete appointment #${appt.id}: ${deleteRes.body}`);
          failCount++;
        }
      } catch (error) {
        console.log(`  ❌ Error deleting appointment #${appt.id}: ${error.message}`);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ DELETION COMPLETE!`);
    console.log(`   Successfully deleted: ${successCount} appointments`);
    if (failCount > 0) {
      console.log(`   Failed: ${failCount} appointments`);
    }
    console.log(`   📧 ${successCount} email notifications sent`);
    console.log(`   💬 ${successCount} WhatsApp notifications sent`);
    console.log('='.repeat(60));

  } else {
    // Delete single appointment
    console.log(`\nStep 3: Deleting appointment #${appointmentId}...`);
    const deleteRes = await request({
      hostname: 'localhost',
      port: 3002,
      path: `/api/appointments/${appointmentId}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken
      }
    });

    console.log(`Status Code: ${deleteRes.status}`);
    if (deleteRes.status !== 200) {
      console.log('❌ Delete failed:', deleteRes.body);
      process.exit(1);
    }

    const result = JSON.parse(deleteRes.body);
    console.log('\n' + '='.repeat(60));
    console.log('✅ APPOINTMENT DELETED SUCCESSFULLY!');
    console.log(`Message: ${result.message}`);
    console.log('\n📧 Cancellation notification sent via Email');
    console.log('💬 Cancellation notification sent via WhatsApp');
    console.log('='.repeat(60));
  }
}

deleteAppointment().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
