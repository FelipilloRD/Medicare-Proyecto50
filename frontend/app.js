// MediCare AI - Frontend Application
// Gestión de citas médicas con IA

const API_BASE = window.location.origin;

// Estado de la aplicación
let currentView = 'home';
let isLoading = false;
let currentUser = null;
let csrfToken = null; // Store CSRF token

/**
 * Get CSRF token from server
 */
async function getCsrfToken() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/csrf-token`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      csrfToken = data.csrfToken;
      return csrfToken;
    }
  } catch (error) {
    console.error('Failed to get CSRF token:', error);
  }
  return null;
}

/**
 * Inicializa la aplicación
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication status (but don't redirect if not authenticated)
  const isAuthenticated = await checkAuthStatus();
  
  // Initialize app components
  initNavigation();
  initLanguageSelector();
  initAppointmentForm();
  initServiceCards();
  initReminderForm();
  initChat();
  
  // Only initialize logout button if authenticated
  if (isAuthenticated) {
    await getCsrfToken();
    initLogoutButton();
    updateUIForUser();
  } else {
    // Show login/register button instead
    initLoginButton();
  }
  
  // Mostrar vista inicial
  showView('home');
});

/**
 * Check if user is authenticated
 */
async function checkAuthStatus() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      credentials: 'include' // Include cookies
    });
    
    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      sessionStorage.setItem('user', JSON.stringify(currentUser));
      return true;
    } else {
      sessionStorage.removeItem('user');
      return false;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    sessionStorage.removeItem('user');
    return false;
  }
}

/**
 * Initialize logout button
 */
function initLogoutButton() {
  // Add logout button to header
  const nav = document.querySelector('.nav');
  if (nav && !document.getElementById('logout-btn')) {
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logout-btn';
    logoutBtn.className = 'btn btn-primary';
    logoutBtn.style.marginLeft = 'auto';
    logoutBtn.textContent = window.i18n.t('logout_button') || 'Cerrar Sesión';
    logoutBtn.addEventListener('click', handleLogout);
    
    // Insert after nav links
    nav.parentElement.insertBefore(logoutBtn, nav.nextSibling);
  }
}

/**
 * Initialize login button (for non-authenticated users)
 */
function initLoginButton() {
  const nav = document.querySelector('.nav');
  if (nav && !document.getElementById('login-btn')) {
    const loginBtn = document.createElement('button');
    loginBtn.id = 'login-btn';
    loginBtn.className = 'btn btn-primary';
    loginBtn.style.marginLeft = 'auto';
    loginBtn.textContent = window.i18n.t('login_button') || 'Iniciar Sesión';
    loginBtn.addEventListener('click', () => {
      window.location.href = '/login';
    });
    
    // Insert after nav links
    nav.parentElement.insertBefore(loginBtn, nav.nextSibling);
  }
}

/**
 * Handle user logout
 */
async function handleLogout() {
  try {
    // Ensure we have a CSRF token
    if (!csrfToken) {
      await getCsrfToken();
    }
    
    const response = await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken || '' // Include CSRF token
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      sessionStorage.removeItem('user');
      currentUser = null;
      window.location.href = '/login';
    } else {
      throw new Error('Logout failed');
    }
  } catch (error) {
    console.error('Logout error:', error);
    showNotification('Error al cerrar sesión', 'error');
  }
}

/**
 * Update UI based on user role
 */
function updateUIForUser() {
  if (!currentUser) return;
  
  // Show user info in header (optional)
  const header = document.querySelector('.header .container');
  if (header && !document.getElementById('user-info')) {
    const userInfo = document.createElement('div');
    userInfo.id = 'user-info';
    userInfo.style.color = 'var(--text-secondary)';
    userInfo.style.fontSize = '0.9rem';
    userInfo.style.marginLeft = 'var(--spacing-sm)';
    userInfo.textContent = `👤 ${currentUser.username}`;
    
    // Insert before logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.parentElement.insertBefore(userInfo, logoutBtn);
    }
  }
  
  // Show dashboard link for admin users
  if (currentUser.role === 'admin') {
    const dashboardLink = document.getElementById('dashboard-link');
    if (dashboardLink) {
      dashboardLink.style.display = 'inline-block';
    }
  }
  
  // Update appointment form based on role
  if (currentUser.role === 'patient') {
    // For patients: pre-fill and disable email field
    const emailInput = document.getElementById('appt-email');
    if (emailInput) {
      emailInput.value = currentUser.email;
      emailInput.readOnly = true;
      emailInput.style.backgroundColor = 'var(--bg-tertiary)';
      emailInput.style.cursor = 'not-allowed';
      
      // Add helper text
      const emailGroup = emailInput.closest('.form-group');
      if (emailGroup && !emailGroup.querySelector('.helper-text')) {
        const helperText = document.createElement('small');
        helperText.className = 'helper-text';
        helperText.style.color = 'var(--text-muted)';
        helperText.style.fontSize = '0.85rem';
        helperText.style.marginTop = '0.25rem';
        helperText.style.display = 'block';
        helperText.textContent = 'Las citas se agendan con tu email de usuario';
        emailGroup.appendChild(helperText);
      }
    }
  }
}

/**
 * Inicializa la navegación
 */
function initNavigation() {
  const navLinks = document.querySelectorAll('[data-view]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      showView(view);
    });
  });
}

/**
 * Muestra una vista específica
 */
function showView(viewName) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  // Mostrar la vista seleccionada
  const targetView = document.getElementById(`${viewName}-view`);
  if (targetView) {
    targetView.classList.add('active');
    currentView = viewName;
  }
  
  // Actualizar navegación activa
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');
}

/**
 * Inicializa el selector de idioma
 */
function initLanguageSelector() {
  const langSelector = document.getElementById('lang-selector');
  if (!langSelector) return;
  
  // Establecer el idioma actual
  langSelector.value = window.i18n.getCurrentLanguage();
  
  // Escuchar cambios
  langSelector.addEventListener('change', (e) => {
    const newLang = e.target.value;
    console.log(`🌍 Cambiando idioma a: ${newLang}`);
    
    // Cambiar idioma (esto aplicará las traducciones automáticamente)
    window.i18n.setLanguage(newLang);
    
    // No recargar la página - las traducciones se aplican dinámicamente
    // location.reload(); // REMOVIDO
  });
  
  console.log(`✅ Selector de idioma inicializado: ${window.i18n.getCurrentLanguage()}`);
}

/**
 * Inicializa el formulario de citas
 */
function initAppointmentForm() {
  const form = document.getElementById('appointment-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await scheduleAppointment();
  });
  
  // Establecer fecha mínima (hoy)
  const dateInput = document.getElementById('appt-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
}

/**
 * Agenda una cita con IA
 */
async function scheduleAppointment() {
  // No authentication required - appointments are public
  
  const form = document.getElementById('appointment-form');
  const submitBtn = form.querySelector('button[type="submit"]');
  const responseDiv = document.getElementById('ai-response');
  
  // Obtener datos del formulario
  const formData = {
    name: document.getElementById('appt-name').value.trim(),
    email: document.getElementById('appt-email').value.trim(),
    phone: document.getElementById('appt-phone').value.trim(),
    date: document.getElementById('appt-date').value,
    time: document.getElementById('appt-time').value,
    service: document.getElementById('appt-service').value,
    notes: document.getElementById('appt-notes').value.trim(),
    lang: window.i18n.getCurrentLanguage()
  };
  
  // Validaciones
  if (!formData.name || !formData.email || !formData.date || !formData.time || !formData.service) {
    showNotification('Por favor completa todos los campos requeridos', 'error');
    return;
  }
  
  try {
    isLoading = true;
    submitBtn.disabled = true;
    submitBtn.textContent = window.i18n.t('form_loading');
    responseDiv.innerHTML = '<div class="loading">⏳ Procesando con IA...</div>';
    
    // Llamar al API (sin CSRF ni credenciales de sesión)
    const response = await fetch(`${API_BASE}/api/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // If unauthorized, redirect to login
      if (response.status === 401) {
        showNotification('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      throw new Error(data.error || 'Error al agendar la cita');
    }
    
    // Guardar en localStorage
    window.db.saveAppointment(data.appointment);
    
    // Mostrar confirmación de la IA
    responseDiv.innerHTML = `
      <div class="ai-confirmation">
        <div class="ai-message">${data.confirmation}</div>
        <div class="notif-sent">
          <span class="notif-badge email">✉️ ${window.i18n.t('notif_email_sent')}</span>
          <span class="notif-badge whatsapp">💬 ${window.i18n.t('notif_whatsapp_sent')}</span>
        </div>
      </div>
    `;
    
    // Limpiar formulario
    form.reset();
    
    showNotification('¡Cita agendada exitosamente!', 'success');
    
  } catch (error) {
    console.error('Error:', error);
    responseDiv.innerHTML = `<div class="error-message">❌ ${error.message}</div>`;
    showNotification(error.message, 'error');
  } finally {
    isLoading = false;
    submitBtn.disabled = false;
    submitBtn.textContent = window.i18n.t('form_submit');
  }
}

/**
 * Inicializa las tarjetas de servicios
 */
function initServiceCards() {
  const serviceCards = document.querySelectorAll('.service-card-modern');
  
  serviceCards.forEach(card => {
    const button = card.querySelector('.service-btn');
    if (button) {
      button.addEventListener('click', async (e) => {
        e.stopPropagation();
        const service = card.getAttribute('data-service');
        await showServiceInfo(service);
      });
    }
    
    // Also allow clicking the card itself
    card.addEventListener('click', async () => {
      const service = card.getAttribute('data-service');
      await showServiceInfo(service);
    });
  });
  
  // Observe service cards for scroll animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });
  
  serviceCards.forEach(card => {
    observer.observe(card);
  });
}

/**
 * Muestra información de un servicio con IA
 */
async function showServiceInfo(service) {
  const modal = document.getElementById('service-modal');
  const modalTitle = document.getElementById('modal-service-title');
  const modalContent = document.getElementById('modal-service-content');
  
  if (!modal) return;
  
  modal.style.display = 'flex';
  modalTitle.textContent = service;
  modalContent.innerHTML = '<div class="loading">⏳ Consultando con IA...</div>';
  
  try {
    const response = await fetch(`${API_BASE}/api/service-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service,
        lang: window.i18n.getCurrentLanguage()
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener información');
    }
    
    modalContent.innerHTML = `<div class="service-info">${data.info}</div>`;
    
  } catch (error) {
    console.error('Error:', error);
    modalContent.innerHTML = `<div class="error-message">❌ ${error.message}</div>`;
  }
  
  // Cerrar modal
  const closeBtn = modal.querySelector('.close-modal');
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = 'none';
    };
  }
  
  // Cerrar al hacer clic fuera
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };
}

/**
 * Inicializa el formulario de recordatorios
 */
function initReminderForm() {
  const form = document.getElementById('reminder-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await generateReminder();
  });
}

/**
 * Genera un recordatorio con IA
 */
async function generateReminder() {
  if (isLoading) return;
  
  const form = document.getElementById('reminder-form');
  const submitBtn = form.querySelector('button[type="submit"]');
  const responseDiv = document.getElementById('reminder-response');
  
  const formData = {
    name: document.getElementById('reminder-name').value.trim(),
    service: document.getElementById('reminder-service').value,
    date: document.getElementById('reminder-date').value,
    lang: window.i18n.getCurrentLanguage()
  };
  
  if (!formData.name || !formData.service || !formData.date) {
    showNotification('Por favor completa todos los campos', 'error');
    return;
  }
  
  try {
    isLoading = true;
    submitBtn.disabled = true;
    submitBtn.textContent = window.i18n.t('loading');
    responseDiv.innerHTML = '<div class="loading">⏳ Generando recordatorio con IA...</div>';
    
    const response = await fetch(`${API_BASE}/api/reminder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al generar recordatorio');
    }
    
    responseDiv.innerHTML = `
      <div class="reminder-result">
        <div class="reminder-message">${data.message}</div>
      </div>
    `;
    
    form.reset();
    showNotification('Recordatorio generado exitosamente', 'success');
    
  } catch (error) {
    console.error('Error:', error);
    responseDiv.innerHTML = `<div class="error-message">❌ ${error.message}</div>`;
    showNotification(error.message, 'error');
  } finally {
    isLoading = false;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Generar Recordatorio';
  }
}

/**
 * Inicializa el chat
 */
function initChat() {
  const form = document.getElementById('chat-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await sendChatMessage();
  });
}

/**
 * Envía un mensaje al chat
 */
async function sendChatMessage() {
  if (isLoading) return;
  
  const input = document.getElementById('chat-input');
  const messagesDiv = document.getElementById('chat-messages');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Agregar mensaje del usuario
  appendChatMessage(message, 'user');
  input.value = '';
  
  // Mostrar indicador de escritura
  const typingId = appendChatMessage('⏳ Escribiendo...', 'assistant', true);
  
  try {
    isLoading = true;
    
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        lang: window.i18n.getCurrentLanguage()
      })
    });
    
    // Read response as text first to handle HTML responses
    const text = await response.text();
    let data = {};
    
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', text);
        
        // Check if it's an HTML response (404 page)
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          throw new Error('El servidor devolvió HTML en lugar de JSON - ruta no encontrada (404)');
        }
        
        throw new Error(`Respuesta inválida del servidor (${response.status})`);
      }
    } else {
      throw new Error(`El servidor no respondió correctamente (${response.status})`);
    }
    
    if (!response.ok) {
      throw new Error(data.error || 'Error en el chat');
    }
    
    // Remover indicador de escritura
    document.getElementById(typingId)?.remove();
    
    // Agregar respuesta de la IA
    appendChatMessage(data.response, 'assistant');
    
  } catch (error) {
    console.error('Error:', error);
    document.getElementById(typingId)?.remove();
    appendChatMessage(`❌ ${error.message}`, 'assistant');
  } finally {
    isLoading = false;
  }
}

/**
 * Agrega un mensaje al chat
 */
function appendChatMessage(text, role, isTemporary = false) {
  const messagesDiv = document.getElementById('chat-messages');
  const messageId = `msg-${Date.now()}`;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${role}`;
  if (isTemporary) messageDiv.id = messageId;
  messageDiv.textContent = text;
  
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
  return messageId;
}

/**
 * Muestra una notificación
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/**
 * Handle API errors globally
 */
async function handleApiResponse(response) {
  if (response.status === 401) {
    // Unauthorized - redirect to login
    sessionStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }
  return response;
}

/**
 * Fetch wrapper with authentication handling
 */
async function authenticatedFetch(url, options = {}) {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  return handleApiResponse(response);
}
