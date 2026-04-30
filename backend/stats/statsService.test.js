/**
 * Unit tests for Statistics Service
 */

const statsService = require('./statsService');
const database = require('../database');

// Test getSummaryStats
console.log('Testing getSummaryStats...');
const summaryStats = statsService.getSummaryStats();
console.log('Summary Stats:', JSON.stringify(summaryStats, null, 2));

// Verify the stats match the database
const appointments = database.getAllAppointments();
const reminders = database.getAllReminders();

console.log('\nVerification:');
console.log(`Expected totalAppointments: ${appointments.length}, Got: ${summaryStats.totalAppointments}`);
console.log(`Expected totalReminders: ${reminders.length}, Got: ${summaryStats.totalReminders}`);
console.log(`Expected pendingReminders: ${reminders.filter(r => r.sent !== 1).length}, Got: ${summaryStats.pendingReminders}`);
console.log(`Expected activeUsers: ${[...new Set(appointments.map(a => a.email))].length}, Got: ${summaryStats.activeUsers}`);

// Test getAppointmentsByDay
console.log('\n\nTesting getAppointmentsByDay...');
const appointmentsByDay = statsService.getAppointmentsByDay(30);
console.log('Appointments by Day (sample):', Object.entries(appointmentsByDay).slice(0, 5));

// Test getAppointmentsByService
console.log('\n\nTesting getAppointmentsByService...');
const appointmentsByService = statsService.getAppointmentsByService();
console.log('Appointments by Service:', JSON.stringify(appointmentsByService, null, 2));

// Test getConfirmationRate
console.log('\n\nTesting getConfirmationRate...');
const confirmationRate = statsService.getConfirmationRate();
console.log(`Confirmation Rate: ${confirmationRate}%`);

// Test getReminderDeliveryRate
console.log('\n\nTesting getReminderDeliveryRate...');
const reminderDeliveryRate = statsService.getReminderDeliveryRate();
console.log(`Reminder Delivery Rate: ${reminderDeliveryRate}%`);

// Test getUpcomingAppointments
console.log('\n\nTesting getUpcomingAppointments...');
const upcomingAppointments = statsService.getUpcomingAppointments(7);
console.log(`Upcoming Appointments (next 7 days): ${upcomingAppointments.length} appointments`);
if (upcomingAppointments.length > 0) {
  console.log('First upcoming:', upcomingAppointments[0]);
}

// Test getRecentAppointments
console.log('\n\nTesting getRecentAppointments...');
const recentAppointments = statsService.getRecentAppointments(5);
console.log(`Recent Appointments: ${recentAppointments.length} appointments`);
if (recentAppointments.length > 0) {
  console.log('Most recent:', recentAppointments[0]);
}

// Test getReminderStats
console.log('\n\nTesting getReminderStats...');
const reminderStats = statsService.getReminderStats();
console.log('Reminder Stats:', JSON.stringify(reminderStats, null, 2));

// Test getDashboardData
console.log('\n\nTesting getDashboardData...');
const dashboardData = statsService.getDashboardData({ days: 30, upcomingDays: 7, recentLimit: 10 });
console.log('Dashboard Data Structure:');
console.log('- Summary:', Object.keys(dashboardData.summary));
console.log('- Charts:', Object.keys(dashboardData.charts));
console.log('- Lists:', Object.keys(dashboardData.lists));
console.log('- Reminder Stats:', Object.keys(dashboardData.reminderStats));
console.log('- Metadata:', dashboardData.metadata);

console.log('\n\n✅ All tests completed successfully!');
