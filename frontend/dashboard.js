/**
 * MediCare AI - Admin Dashboard
 * Real-time statistics and charts with auto-refresh
 */

const API_BASE = window.location.origin;
let csrfToken = null;
let currentUser = null;
let dashboardData = null;
let charts = {};
let autoRefreshInterval = null;

// Chart.js default configuration
Chart.defaults.color = '#d1d5db';
Chart.defaults.borderColor = 'rgba(59, 130, 246, 0.2)';
Chart.defaults.font.family = 'Inter, sans-serif';

/**
 * Initialize dashboard on page load
 */
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthAndRole();
  await getCsrfToken();
  initLogoutButton();
  initRefreshButton();
  initExportButton();
  await loadDashboard();
  startAutoRefresh();
});

/**
 * Check authentication and admin role
 */
async function checkAuthAndRole() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      window.location.href = '/login';
      return;
    }
    
    const data = await response.json();
    currentUser = data.user;
    
    // Check if user is admin
    if (currentUser.role !== 'admin') {
      alert('Acceso denegado. Solo administradores pueden acceder al dashboard.');
      window.location.href = '/';
      return;
    }
    
    // Update user info in header
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
      userInfo.textContent = `👤 ${currentUser.username} (Admin)`;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = '/login';
  }
}

/**
 * Get CSRF token
 */
async function getCsrfToken() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/csrf-token`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      csrfToken = data.csrfToken;
    }
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }
}

/**
 * Initialize logout button
 */
function initLogoutButton() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'x-csrf-token': csrfToken
          }
        });
        window.location.href = '/login';
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  }
}

/**
 * Initialize refresh button
 */
function initRefreshButton() {
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = '🔄 Actualizando...';
      await loadDashboard();
      refreshBtn.disabled = false;
      refreshBtn.textContent = '🔄 Actualizar';
    });
  }
}

/**
 * Initialize export button
 */
function initExportButton() {
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportToCSV);
  }
}

/**
 * Load dashboard data
 */
async function loadDashboard() {
  showLoading(true);
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/dashboard?days=30&upcomingDays=7&recentLimit=10`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to load dashboard data');
    }
    
    dashboardData = await response.json();
    
    // Update UI
    updateSummaryCards(dashboardData.summary);
    updateCharts(dashboardData.charts);
    updateUpcomingAppointments(dashboardData.lists.upcomingAppointments);
    updateRecentAppointments(dashboardData.lists.recentAppointments);
    updateLastUpdated(dashboardData.metadata.lastUpdated);
    
    showLoading(false);
  } catch (error) {
    console.error('Dashboard load error:', error);
    showLoading(false);
    alert('Error al cargar el dashboard. Por favor intenta de nuevo.');
  }
}

/**
 * Show/hide loading state
 */
function showLoading(show) {
  const loadingState = document.getElementById('loading-state');
  const dashboardContent = document.getElementById('dashboard-content');
  
  if (show) {
    loadingState.style.display = 'flex';
    dashboardContent.style.display = 'none';
  } else {
    loadingState.style.display = 'none';
    dashboardContent.style.display = 'block';
  }
}

/**
 * Update summary cards
 */
function updateSummaryCards(summary) {
  document.getElementById('stat-appointments').textContent = summary.totalAppointments || 0;
  document.getElementById('stat-reminders').textContent = summary.totalReminders || 0;
  document.getElementById('stat-sent-reminders').textContent = summary.sentReminders || 0;
}

/**
 * Update charts
 */
function updateCharts(chartsData) {
  updateAppointmentsTrendChart(chartsData.appointmentsByDay);
  updateServiceDistributionChart(chartsData.serviceStats);
  updateQualityMetricsChart(chartsData.confirmationRate, chartsData.reminderDeliveryRate);
  
  // Update confirmation rate in summary card
  document.getElementById('stat-confirmation').textContent = `${chartsData.confirmationRate || 0}%`;
}

/**
 * Update appointments trend chart (Line chart)
 */
function updateAppointmentsTrendChart(appointmentsByDay) {
  const ctx = document.getElementById('appointments-trend-chart');
  
  // Destroy existing chart
  if (charts.trendChart) {
    charts.trendChart.destroy();
  }
  
  // Sort dates
  const sortedDates = Object.keys(appointmentsByDay).sort();
  const labels = sortedDates.map(date => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  });
  const data = sortedDates.map(date => appointmentsByDay[date]);
  
  charts.trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Citas por día',
        data: data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          padding: 12,
          titleColor: '#f9fafb',
          bodyColor: '#d1d5db',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          },
          grid: {
            color: 'rgba(59, 130, 246, 0.1)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/**
 * Update service distribution chart (Doughnut chart)
 */
function updateServiceDistributionChart(serviceStats) {
  const ctx = document.getElementById('service-distribution-chart');
  
  // Destroy existing chart
  if (charts.serviceChart) {
    charts.serviceChart.destroy();
  }
  
  const labels = serviceStats.map(s => s.service);
  const data = serviceStats.map(s => s.count);
  const colors = [
    '#3b82f6', '#06b6d4', '#8b5cf6', '#10b981', 
    '#f59e0b', '#ef4444', '#ec4899', '#6366f1'
  ];
  
  charts.serviceChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderColor: '#1a2332',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 15,
            font: {
              size: 12
            },
            generateLabels: function(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    hidden: false,
                    index: i
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          padding: 12,
          titleColor: '#f9fafb',
          bodyColor: '#d1d5db',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Update quality metrics chart (Bar chart)
 */
function updateQualityMetricsChart(confirmationRate, reminderDeliveryRate) {
  const ctx = document.getElementById('quality-metrics-chart');
  
  // Destroy existing chart
  if (charts.qualityChart) {
    charts.qualityChart.destroy();
  }
  
  charts.qualityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Tasa de Confirmación', 'Tasa de Entrega de Recordatorios'],
      datasets: [{
        label: 'Porcentaje (%)',
        data: [confirmationRate || 0, reminderDeliveryRate || 0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: [
          '#3b82f6',
          '#10b981'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          padding: 12,
          titleColor: '#f9fafb',
          bodyColor: '#d1d5db',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return `${context.parsed.y.toFixed(2)}%`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          },
          grid: {
            color: 'rgba(59, 130, 246, 0.1)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

/**
 * Update upcoming appointments table
 */
function updateUpcomingAppointments(appointments) {
  const tbody = document.getElementById('upcoming-appointments-table');
  const countSpan = document.getElementById('upcoming-count');
  
  countSpan.textContent = `${appointments.length} citas programadas`;
  
  if (appointments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted);">
          No hay citas próximas
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = appointments.map(appt => `
    <tr>
      <td>${appt.name}</td>
      <td>${appt.service}</td>
      <td>${new Date(appt.date).toLocaleDateString('es-ES', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })}</td>
      <td>${appt.time}</td>
      <td>${appt.email}</td>
      <td>
        <button class="btn-delete" onclick="deleteAppointment(${appt.id}, '${appt.name}')" title="Cancelar cita">
          🗑️ Cancelar
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Update recent appointments table
 */
function updateRecentAppointments(appointments) {
  const tbody = document.getElementById('recent-appointments-table');
  
  if (appointments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted);">
          No hay citas recientes
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = appointments.map(appt => {
    const apptDate = new Date(appt.date);
    const now = new Date();
    const isPast = apptDate < now;
    const statusBadge = isPast 
      ? '<span class="status-badge status-completed">Completada</span>'
      : '<span class="status-badge status-upcoming">Próxima</span>';
    
    return `
      <tr>
        <td>#${appt.id}</td>
        <td>${appt.name}</td>
        <td>${appt.service}</td>
        <td>${apptDate.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn-delete" onclick="deleteAppointment(${appt.id}, '${appt.name}')" title="Cancelar cita">
            🗑️ Cancelar
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Update last updated timestamp
 */
function updateLastUpdated(timestamp) {
  const lastUpdated = document.getElementById('last-updated');
  const date = new Date(timestamp);
  lastUpdated.textContent = date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Start auto-refresh (every 5 minutes)
 */
function startAutoRefresh() {
  // Clear existing interval
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
  
  // Refresh every 5 minutes (300000 ms)
  autoRefreshInterval = setInterval(async () => {
    console.log('Auto-refreshing dashboard...');
    await loadDashboard();
  }, 300000);
}

/**
 * Export dashboard data to CSV
 */
function exportToCSV() {
  if (!dashboardData) {
    alert('No hay datos para exportar');
    return;
  }
  
  // Create CSV content
  let csv = 'MediCare AI - Dashboard Export\n';
  csv += `Fecha de exportación: ${new Date().toLocaleString('es-ES')}\n\n`;
  
  // Summary statistics
  csv += 'RESUMEN DE ESTADÍSTICAS\n';
  csv += 'Métrica,Valor\n';
  csv += `Total de Citas,${dashboardData.summary.totalAppointments}\n`;
  csv += `Total de Recordatorios,${dashboardData.summary.totalReminders}\n`;
  csv += `Recordatorios Enviados,${dashboardData.summary.sentReminders}\n`;
  csv += `Recordatorios Pendientes,${dashboardData.summary.pendingReminders}\n`;
  csv += `Tasa de Confirmación,${dashboardData.charts.confirmationRate}%\n`;
  csv += `Tasa de Entrega de Recordatorios,${dashboardData.charts.reminderDeliveryRate}%\n\n`;
  
  // Service distribution
  csv += 'DISTRIBUCIÓN POR SERVICIO\n';
  csv += 'Servicio,Cantidad,Porcentaje\n';
  dashboardData.charts.serviceStats.forEach(stat => {
    csv += `${stat.service},${stat.count},${stat.percentage}%\n`;
  });
  csv += '\n';
  
  // Upcoming appointments
  csv += 'PRÓXIMAS CITAS\n';
  csv += 'Paciente,Servicio,Fecha,Hora,Email\n';
  dashboardData.lists.upcomingAppointments.forEach(appt => {
    csv += `${appt.name},${appt.service},${appt.date},${appt.time},${appt.email}\n`;
  });
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().split('T')[0];
  
  link.setAttribute('href', url);
  link.setAttribute('download', `medicare-ai-dashboard-${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Delete appointment with confirmation
 */
async function deleteAppointment(appointmentId, patientName) {
  // Confirm deletion
  const confirmed = confirm(
    `¿Estás seguro de que quieres cancelar la cita de ${patientName}?\n\n` +
    `Se enviará automáticamente una notificación de cancelación por email y WhatsApp al paciente.`
  );
  
  if (!confirmed) {
    return;
  }
  
  try {
    // Show loading state
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(btn => {
      if (btn.onclick.toString().includes(appointmentId)) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Cancelando...';
      }
    });
    
    // Get CSRF token
    const csrfResponse = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!csrfResponse.ok) {
      throw new Error('Error obteniendo token CSRF');
    }
    
    const csrfData = await csrfResponse.json();
    
    // Delete appointment
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfData.token
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al cancelar la cita');
    }
    
    const result = await response.json();
    
    // Show success message
    alert(`✅ Cita de ${patientName} cancelada exitosamente.\n\nSe han enviado las notificaciones automáticas por email y WhatsApp.`);
    
    // Refresh dashboard data
    await loadDashboard();
    
  } catch (error) {
    console.error('Error deleting appointment:', error);
    alert(`❌ Error al cancelar la cita: ${error.message}`);
    
    // Restore button state
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(btn => {
      if (btn.onclick.toString().includes(appointmentId)) {
        btn.disabled = false;
        btn.innerHTML = '🗑️ Cancelar';
      }
    });
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
  
  // Destroy all charts
  Object.values(charts).forEach(chart => {
    if (chart) chart.destroy();
  });
});
