/**
 * Statistics Service
 * Handles data aggregation and calculation for the admin dashboard
 */

const database = require('../database-postgres');

/**
 * Get summary statistics for the dashboard
 * @returns {Object} Summary statistics including total appointments, reminders, etc.
 */
function getSummaryStats() {
  const appointments = database.getAllAppointments();
  const reminders = database.getAllReminders();
  
  return {
    totalAppointments: appointments.length,
    totalReminders: reminders.length,
    pendingReminders: reminders.filter(r => r.sent !== 1).length,
    sentReminders: reminders.filter(r => r.sent === 1).length,
    activeUsers: [...new Set(appointments.map(a => a.email))].length
  };
}

/**
 * Get appointments grouped by day for a specified number of days
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {Object} Appointments grouped by date
 */
function getAppointmentsByDay(days = 30) {
  const appointments = database.getAllAppointments();
  const now = new Date();
  const daysAgo = new Date(now.getTime() - (parseInt(days) * 24 * 60 * 60 * 1000));
  
  const appointmentsByDay = {};
  
  // Count appointments by day
  appointments.forEach(appt => {
    const date = appt.date;
    if (new Date(date) >= daysAgo) {
      appointmentsByDay[date] = (appointmentsByDay[date] || 0) + 1;
    }
  });
  
  // Fill in missing dates with 0 for complete chart data
  for (let d = new Date(daysAgo); d <= now; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    if (!appointmentsByDay[dateStr]) {
      appointmentsByDay[dateStr] = 0;
    }
  }
  
  return appointmentsByDay;
}

/**
 * Get appointments grouped by service type
 * @returns {Object} Appointments grouped by service with counts and percentages
 */
function getAppointmentsByService() {
  const appointments = database.getAllAppointments();
  const total = appointments.length;
  
  const appointmentsByService = {};
  
  // Count appointments by service
  appointments.forEach(appt => {
    const service = appt.service || 'Unknown';
    appointmentsByService[service] = (appointmentsByService[service] || 0) + 1;
  });
  
  // Calculate percentages and create detailed stats
  const serviceStats = Object.entries(appointmentsByService).map(([service, count]) => ({
    service,
    count,
    percentage: total > 0 ? Math.round((count / total * 100) * 100) / 100 : 0
  })).sort((a, b) => b.count - a.count);
  
  return {
    appointmentsByService,
    serviceStats,
    totalAppointments: total
  };
}

/**
 * Calculate appointment confirmation rate
 * @returns {number} Percentage of appointments with AI confirmations
 */
function getConfirmationRate() {
  const appointments = database.getAllAppointments();
  
  if (appointments.length === 0) {
    return 0;
  }
  
  const appointmentsWithConfirmation = appointments.filter(appt => appt.ai_confirmation).length;
  return Math.round((appointmentsWithConfirmation / appointments.length * 100) * 100) / 100;
}

/**
 * Calculate reminder delivery success rate
 * @returns {number} Percentage of reminders successfully sent
 */
function getReminderDeliveryRate() {
  const reminders = database.getAllReminders();
  
  if (reminders.length === 0) {
    return 0;
  }
  
  const sentReminders = reminders.filter(r => r.sent === 1).length;
  return Math.round((sentReminders / reminders.length * 100) * 100) / 100;
}

/**
 * Get upcoming appointments (next 7 days)
 * @param {number} days - Number of days to look ahead (default: 7)
 * @returns {Array} List of upcoming appointments sorted by date/time
 */
function getUpcomingAppointments(days = 7) {
  const appointments = database.getAllAppointments();
  const now = new Date();
  const futureDate = new Date(now.getTime() + (parseInt(days) * 24 * 60 * 60 * 1000));
  
  return appointments
    .filter(appt => {
      const apptDate = new Date(appt.date);
      return apptDate >= now && apptDate <= futureDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time);
      const dateB = new Date(b.date + 'T' + b.time);
      return dateA - dateB;
    });
}

/**
 * Get recent appointments
 * @param {number} limit - Maximum number of appointments to return (default: 10)
 * @returns {Array} List of recent appointments sorted by creation date
 */
function getRecentAppointments(limit = 10) {
  const appointments = database.getAllAppointments();
  
  return appointments
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.date);
      const dateB = new Date(b.created_at || b.date);
      return dateB - dateA;
    })
    .slice(0, parseInt(limit));
}

/**
 * Get reminder statistics
 * @returns {Object} Detailed reminder statistics
 */
function getReminderStats() {
  const reminders = database.getAllReminders();
  
  return {
    total: reminders.length,
    sent: reminders.filter(r => r.sent === 1).length,
    pending: reminders.filter(r => r.sent !== 1).length,
    auto: reminders.filter(r => r.auto === true || r.auto === 1).length,
    manual: reminders.filter(r => r.auto === false || r.auto === 0).length,
    deliveryRate: getReminderDeliveryRate()
  };
}

/**
 * Get complete dashboard data
 * @param {Object} options - Options for customizing dashboard data
 * @param {number} options.days - Number of days for appointment trends (default: 30)
 * @param {number} options.upcomingDays - Number of days for upcoming appointments (default: 7)
 * @param {number} options.recentLimit - Number of recent appointments to include (default: 10)
 * @returns {Object} Complete dashboard data including all statistics and charts
 */
function getDashboardData(options = {}) {
  const {
    days = 30,
    upcomingDays = 7,
    recentLimit = 10
  } = options;
  
  const now = new Date();
  const daysAgo = new Date(now.getTime() - (parseInt(days) * 24 * 60 * 60 * 1000));
  
  return {
    summary: getSummaryStats(),
    charts: {
      appointmentsByDay: getAppointmentsByDay(days),
      appointmentsByService: getAppointmentsByService().appointmentsByService,
      serviceStats: getAppointmentsByService().serviceStats,
      confirmationRate: getConfirmationRate(),
      reminderDeliveryRate: getReminderDeliveryRate()
    },
    lists: {
      upcomingAppointments: getUpcomingAppointments(upcomingDays).slice(0, 10),
      recentAppointments: getRecentAppointments(recentLimit)
    },
    reminderStats: getReminderStats(),
    metadata: {
      lastUpdated: new Date().toISOString(),
      dateRange: {
        from: daysAgo.toISOString().split('T')[0],
        to: now.toISOString().split('T')[0]
      }
    }
  };
}

module.exports = {
  getSummaryStats,
  getAppointmentsByDay,
  getAppointmentsByService,
  getConfirmationRate,
  getReminderDeliveryRate,
  getUpcomingAppointments,
  getRecentAppointments,
  getReminderStats,
  getDashboardData
};
