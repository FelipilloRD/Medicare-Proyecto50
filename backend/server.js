require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { doubleCsrf } = require('csrf-csrf');
const { OpenAI } = require('openai');
const { Groq } = require('groq-sdk');
// Cambiar entre JSON y PostgreSQL:
// const database = require('./database');           // JSON (original)
const database = require('./database-postgres');  // PostgreSQL (nuevo)
const notificationService = require('./notifications/notificationService');
const authService = require('./auth/authService');
const statsService = require('./stats/statsService');
const { requireAuth, requireAdmin, requirePatient, requirePatientOrOwn, requireAppointmentAccess, applyRoleBasedFiltering, optionalAuth, checkSession } = require('./auth/middleware');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002', 
    'http://18.224.136.235:3002',
    'http://3.138.100.95:3002',  // New AWS server IP
    /\.netlify\.app$/,  // Allow all Netlify domains
    /\.netlify\.com$/   // Allow Netlify preview domains
  ],
  credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());

// Session configuration with enhanced security
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  secret: process.env.SESSION_SECRET || 'medicare-ai-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to false for HTTP (true only for HTTPS)
    httpOnly: true, // Prevent XSS attacks by making cookie inaccessible to JavaScript
    maxAge: 24 * 60 * 60 * 1000, // 24 hours session timeout
    sameSite: 'lax' // Allow cookies on redirects (more permissive than 'strict')
  }
}));

// CSRF Protection configuration
const {
  generateCsrfToken, // Use this in routes to generate a CSRF token (correct function name)
  doubleCsrfProtection, // This is the middleware to validate CSRF tokens
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'medicare-ai-csrf-secret-change-in-production',
  cookieName: 'x-csrf-token',
  cookieOptions: {
    secure: false, // Set to false for HTTP (true only for HTTPS)
    httpOnly: false, // Must be false so the client can read the cookie for double-submit pattern
    sameSite: 'lax' // Allow cookies on redirects
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => req.headers['x-csrf-token'] || req.body.csrfToken,
  getSessionIdentifier: (req) => req.session.userId || req.sessionID // Use session ID for CSRF token generation
});

// Session check middleware for all routes
app.use(checkSession);

app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ═══════════════════════════════════════════════════════════════
// RUTAS LIMPIAS (URLs sin extensiones de archivo)
// ═══════════════════════════════════════════════════════════════

// Ruta principal - redirige a index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Ruta de login limpia
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

// Ruta de dashboard limpia (requiere autenticación)
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dashboard.html'));
});

// Ruta de inicio limpia (alias para la principal)
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Ruta de inicio limpia (alias para la principal)
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ═══════════════════════════════════════════════════════════════

// Clientes de IA (Groq como principal, OpenAI como fallback)
let groq = null;
let openai = null;

// Configurar Groq (IA gratis recomendada)
if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('demo') && !process.env.GROQ_API_KEY.includes('xxxxxxxx')) {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
}

// Configurar OpenAI (fallback si Groq no está disponible)
if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('demo') && !process.env.OPENAI_API_KEY.includes('xxxxxxxx')) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * Llama a una IA (Groq -> OpenAI -> Demo) con el prompt dado
 * Prioridad: 1. Groq (gratis), 2. OpenAI, 3. Modo demo
 */
async function callOpenAI(systemPrompt, userMessage, maxTokens = 500) {
  try {
    // ===== INTENTAR GROQ PRIMERO (IA GRATIS) =====
    if (groq) {
      try {
        console.log('🤖 Usando Groq (IA gratis)');
        const completion = await groq.chat.completions.create({
          model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: parseInt(process.env.GROQ_MAX_TOKENS) || maxTokens,
          temperature: 0.7,
        });
        
        return completion.choices[0].message.content;
      } catch (groqError) {
        console.log('⚠️  Groq falló, intentando OpenAI:', groqError.message);
      }
    }
    
    // ===== INTENTAR OPENAI (FALLBACK) =====
    if (openai) {
      try {
        console.log('🤖 Usando OpenAI');
        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || maxTokens,
          temperature: 0.7,
        });
        
        return completion.choices[0].message.content;
      } catch (openaiError) {
        console.log('⚠️  OpenAI falló, usando modo demo:', openaiError.message);
      }
    }
    
    // ===== MODO DEMO (SI TODO FALLA) =====
    console.log('⚠️  Modo demo - Sin credenciales de IA');
    
    // Respuestas simuladas para demo
    const demoResponses = {
      'confirmation': `¡Hola! Tu cita ha sido confirmada exitosamente. 
      
**Detalles de tu cita:**
📅 Fecha: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
⏰ Hora: 10:00 AM
🏥 Servicio: Consulta General
👨‍⚕️ Doctor: Dr. Carlos Rodríguez

**Instrucciones importantes:**
- Llega 15 minutos antes
- Trae tu identificación
- Evita comer 2 horas antes

¡Te esperamos en MediCare AI! ✨`,
      
      'service_info': `**Consulta General** es nuestro servicio médico principal.

**Qué incluye:**
- Evaluación médica completa
- Revisión de signos vitales
- Diagnóstico inicial
- Plan de tratamiento

**Cuándo se necesita:**
- Síntomas generales (fiebre, dolor, malestar)
- Revisiones de rutina
- Certificados médicos
- Segundas opiniones

**Duración:** 30-45 minutos aproximadamente.

**Costo:** $50 USD (incluye consulta básica)`,
      
      'reminder': `⏰ **Recordatorio importante**

Tu cita médica es mañana. Por favor:
- Llega 15 minutos antes
- Trae tu identificación
- Evita comer 2 horas antes si es necesario

¡Nos vemos pronto en MediCare AI! 🏥`,
      
      'chat': `¡Hola! Soy tu asistente virtual de MediCare AI. 

**Servicios disponibles:**
1. Consulta General
2. Cardiología
3. Pediatría
4. Dermatología
5. Laboratorio
6. Rayos X
7. Odontología
8. Psicología

**Horario de atención:**
Lunes a Viernes: 8:00 AM - 6:00 PM
Sábados: 9:00 AM - 1:00 PM

**Contacto:**
📞 +1 829 555 0000
✉️ info@medicare-ai.com
📍 Av. Principal 123, Santo Domingo, RD

¿En qué puedo ayudarte hoy?`
    };
    
    // Determinar tipo de respuesta basado en el prompt
    let responseType = 'chat';
    if (systemPrompt.includes('confirma')) responseType = 'confirmation';
    if (systemPrompt.includes('servicio')) responseType = 'service_info';
    if (systemPrompt.includes('recordatorio')) responseType = 'reminder';
    
    // Simular delay de IA
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return demoResponses[responseType] || demoResponses.chat;
    
  } catch (error) {
    console.error('Error en callOpenAI:', error.message);
    throw new Error('Error al comunicarse con la IA');
  }
}

/**
 * Genera recordatorio automático con IA (async, no bloquea)
 */
async function generateAutoReminder(appointment) {
  try {
    const systemPrompt = `Eres un asistente médico profesional de ${process.env.CLINIC_NAME || 'MediCare AI'}. 
Genera un recordatorio breve y amigable (máximo 3 líneas) para una cita médica.
Responde en ${appointment.lang || 'español'}.`;

    const userMessage = `Genera un recordatorio para:
Paciente: ${appointment.name}
Servicio: ${appointment.service}
Fecha: ${appointment.date}
Hora: ${appointment.time}`;

    const reminderText = await callOpenAI(systemPrompt, userMessage, 300);
    
    // Guardar recordatorio en la base de datos
    database.createReminder({
      appointment_id: appointment.id,
      name: appointment.name,
      service: appointment.service,
      date: appointment.date,
      lang: appointment.lang || 'es',
      message: reminderText,
      auto: true
    });
    
    console.log(`[${new Date().toISOString()}] ✅ Auto-reminder generated for appointment #${appointment.id}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Failed to generate auto-reminder:`, error.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// ENDPOINTS API
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION ENDPOINTS
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/auth/login - User login
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }
    
    // Authenticate user
    const user = await authService.authenticateUser(username, password);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }
    
    // Create session
    req.session.userId = user.id;
    req.session.createdAt = new Date().toISOString();
    req.session.lastActivity = new Date().toISOString();
    
    // Save session before sending response
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ 
          error: 'Session error',
          message: 'Failed to create session'
        });
      }
      
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        message: 'Login successful'
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred during login'
    });
  }
});

/**
 * POST /api/auth/register - User registration
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        message: 'Por favor proporciona email y contraseña'
      });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format',
        message: 'El formato del email no es válido'
      });
    }
    
    // Validar contraseña (mínimo 8 caracteres)
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password too short',
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    }
    
    // Generar username desde el email (parte antes del @)
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Verificar si el usuario ya existe
    const existingUser = await database.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'User already exists',
        message: 'Ya existe una cuenta con este email'
      });
    }
    
    // Crear usuario usando authService (que hashea la contraseña)
    const newUser = await authService.createUser({
      username,
      email,
      password,
      role: 'patient' // Todos los nuevos usuarios son pacientes
    });
    
    if (!newUser) {
      return res.status(500).json({ 
        error: 'Registration failed',
        message: 'No se pudo crear la cuenta. Intenta nuevamente.'
      });
    }
    
    // Crear sesión automáticamente después del registro
    req.session.userId = newUser.id;
    req.session.createdAt = new Date().toISOString();
    req.session.lastActivity = new Date().toISOString();
    
    // Save session before sending response
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ 
          error: 'Session error',
          message: 'Cuenta creada pero no se pudo iniciar sesión automáticamente'
        });
      }
      
      res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        },
        message: 'Registration successful'
      });
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Ocurrió un error al crear la cuenta'
    });
  }
});

/**
 * POST /api/auth/logout - User logout
 */
app.post('/api/auth/logout', requireAuth, doubleCsrfProtection, (req, res) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ 
            error: 'Failed to logout',
            message: 'An error occurred during logout'
          });
        }
        
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({
          success: true,
          message: 'Logout successful'
        });
      });
    } else {
      res.json({
        success: true,
        message: 'Already logged out'
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred during logout'
    });
  }
});

/**
 * GET /api/auth/me - Get current user info
 */
app.get('/api/auth/me', requireAuth, (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to get user information'
    });
  }
});

/**
 * GET /api/auth/check-role - Check user role
 */
app.get('/api/auth/check-role', requireAuth, (req, res) => {
  try {
    res.json({
      success: true,
      role: req.user.role,
      isAdmin: req.user.role === 'admin',
      isPatient: req.user.role === 'patient',
      permissions: {
        canViewAllAppointments: req.user.role === 'admin',
        canViewDashboard: req.user.role === 'admin',
        canManageSystem: req.user.role === 'admin',
        canViewOwnAppointments: true,
        canCancelOwnAppointments: true
      }
    });
  } catch (error) {
    console.error('Check role error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to check user role'
    });
  }
});

/**
 * GET /api/auth/csrf-token - Get CSRF token for authenticated users
 */
app.get('/api/auth/csrf-token', requireAuth, (req, res) => {
  try {
    const csrfToken = generateCsrfToken(req, res);
    res.json({
      success: true,
      csrfToken
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to generate CSRF token'
    });
  }
});

/**
 * GET /api/csrf-token - Get CSRF token (simplified endpoint)
 */
app.get('/api/csrf-token', requireAuth, (req, res) => {
  try {
    const token = generateCsrfToken(req, res);
    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to generate CSRF token'
    });
  }
});

/**
 * GET /api/auth/permissions - Get detailed user permissions
 */
app.get('/api/auth/permissions', requireAuth, (req, res) => {
  try {
    const permissions = {
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      },
      access: {
        dashboard: req.user.role === 'admin',
        allAppointments: req.user.role === 'admin',
        systemStats: req.user.role === 'admin',
        userManagement: req.user.role === 'admin',
        backupManagement: req.user.role === 'admin',
        reminderManagement: req.user.role === 'admin',
        ownAppointments: true,
        scheduleAppointments: true,
        cancelOwnAppointments: true
      },
      dataFilters: {
        appointmentAccess: req.user.role === 'admin' ? 'all' : 'own',
        searchScope: req.user.role === 'admin' ? 'global' : 'personal'
      }
    };
    
    res.json({
      success: true,
      permissions
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to get user permissions'
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// EXISTING API ENDPOINTS
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/ai - Endpoint genérico para llamar a la IA
 */
app.post('/api/ai', requireAuth, doubleCsrfProtection, async (req, res) => {
  try {
    const { system, messages } = req.body;
    
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un mensaje' });
    }
    
    const lastMessage = messages[messages.length - 1];
    const text = await callOpenAI(system, lastMessage.content);
    
    res.json({ text });
  } catch (error) {
    console.error('Error en /api/ai:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/schedule - Agenda una cita con confirmación de IA
 */
app.post('/api/schedule', requireAuth, doubleCsrfProtection, async (req, res) => {
  try {
    let { name, email, phone, date, time, service, notes, lang } = req.body;
    
    // Validaciones básicas
    if (!name || !date || !time || !service) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Role-based email handling:
    // - Patient users: Always use their own email (ignore email from form)
    // - Admin users: Can schedule for any email
    if (req.user.role === 'patient') {
      email = req.user.email; // Force patient's own email
      console.log(`Patient ${req.user.username} scheduling appointment with their email: ${email}`);
    } else if (req.user.role === 'admin') {
      // Admin can use any email, but require it
      if (!email) {
        return res.status(400).json({ 
          error: 'Email is required',
          message: 'Admin users must provide an email address for the appointment'
        });
      }
      console.log(`Admin ${req.user.username} scheduling appointment for: ${email}`);
    }
    
    // Generar confirmación con IA (con fallback a mensaje por defecto)
    let aiConfirmation = '';
    try {
      const systemPrompt = `Eres un asistente médico profesional y empático de ${process.env.CLINIC_NAME || 'MediCare AI'}.
Confirma la cita de manera cálida y profesional.
Responde en ${lang || 'español'}.
Incluye los detalles de la cita y un mensaje tranquilizador.`;

      const userMessage = `Confirma esta cita:
Paciente: ${name}
Servicio: ${service}
Fecha: ${date}
Hora: ${time}
${notes ? `Notas: ${notes}` : ''}`;

      aiConfirmation = await callOpenAI(systemPrompt, userMessage, 300);
    } catch (error) {
      console.log('⚠️  IA falló, usando mensaje por defecto:', error.message);
      // Mensaje de confirmación por defecto
      aiConfirmation = `¡Hola ${name}! Tu cita de ${service} ha sido confirmada para el ${date} a las ${time}. 
      
**Detalles de tu cita:**
📅 Fecha: ${date}
⏰ Hora: ${time}
🏥 Servicio: ${service}
👨‍⚕️ Doctor: Dr. Carlos Rodríguez

**Instrucciones importantes:**
- Llega 15 minutos antes
- Trae tu identificación
- Evita comer 2 horas antes si es necesario

¡Te esperamos en ${process.env.CLINIC_NAME || 'MediCare AI'}! ✨`;
    }
    
    // Guardar cita en la base de datos
    const appointment = database.createAppointment({
      name,
      email,
      phone,
      date,
      time,
      service,
      notes,
      ai_confirmation: aiConfirmation,
      lang: lang || 'es'
    });
    
    // Enviar notificaciones (async, no bloquea la respuesta)
    notificationService.notifyAppointmentCreated(appointment, aiConfirmation)
      .catch(err => console.error('Notification error:', err));
    
    // Generar recordatorio automático (async, no bloquea)
    generateAutoReminder(appointment)
      .catch(err => console.error('Auto-reminder error:', err));
    
    res.json({
      success: true,
      appointment,
      confirmation: aiConfirmation
    });
  } catch (error) {
    console.error('Error en /api/schedule:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/service-info - Obtiene información de un servicio médico
 */
app.post('/api/service-info', requireAuth, doubleCsrfProtection, async (req, res) => {
  try {
    const { service, lang } = req.body;
    
    if (!service) {
      return res.status(400).json({ error: 'Se requiere el nombre del servicio' });
    }
    
    const systemPrompt = `Eres un asistente médico experto de ${process.env.CLINIC_NAME || 'MediCare AI'}.
Proporciona información clara y profesional sobre servicios médicos.
Responde en ${lang || 'español'}.`;

    const userMessage = `Describe el servicio médico: ${service}
Incluye: qué es, cuándo se necesita, qué esperar, y duración aproximada.`;

    const info = await callOpenAI(systemPrompt, userMessage, 400);
    
    res.json({ info });
  } catch (error) {
    console.error('Error en /api/service-info:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reminder - Genera un recordatorio manual
 */
app.post('/api/reminder', requireAuth, doubleCsrfProtection, async (req, res) => {
  try {
    const { name, service, date, lang } = req.body;
    
    if (!service || !date) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // For patient users, use their own email as the name
    // For admin users, use the provided name or default to "Patient"
    let reminderName = name;
    if (req.user.role === 'patient') {
      reminderName = req.user.email; // Patients can only create reminders for themselves
    } else if (!reminderName) {
      reminderName = 'Patient'; // Default for admins
    }
    
    const systemPrompt = `Eres un asistente médico de ${process.env.CLINIC_NAME || 'MediCare AI'}.
Genera un recordatorio amigable y profesional.
Responde en ${lang || 'español'}.`;

    const userMessage = `Genera un recordatorio para:
Paciente: ${reminderName}
Servicio: ${service}
Fecha: ${date}`;

    const message = await callOpenAI(systemPrompt, userMessage, 200);
    
    const reminder = database.createReminder({
      name: reminderName,
      service,
      date,
      lang: lang || 'es',
      message,
      auto: false,
      created_by: req.user.id // Track who created the reminder
    });
    
    res.json({ success: true, reminder, message });
  } catch (error) {
    console.error('Error en /api/reminder:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat - Chat asistente multiidioma
 */
app.post('/api/chat', requireAuth, doubleCsrfProtection, async (req, res) => {
  try {
    const { message, lang } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Se requiere un mensaje' });
    }
    
    const systemPrompt = `Eres un asistente médico virtual 24/7 de ${process.env.CLINIC_NAME || 'MediCare AI'}.
Ayudas a los pacientes con información sobre servicios, citas, y preguntas generales de salud.
Eres profesional, empático y claro.
Responde en ${lang || 'español'}.
Si te preguntan sobre agendar citas, indica que pueden usar el formulario en la sección "Agendar Cita".
Información de contacto:
- Teléfono: ${process.env.CLINIC_PHONE || '+1 829 555 0000'}
- Email: ${process.env.CLINIC_EMAIL || 'info@medicare-ai.com'}
- Dirección: ${process.env.CLINIC_ADDRESS || 'Av. Principal 123, Santo Domingo, RD'}`;

    const response = await callOpenAI(systemPrompt, message, 300);
    
    res.json({ response });
  } catch (error) {
    console.error('Error en /api/chat:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/appointments - Lista todas las citas (con filtrado por rol)
 */
app.get('/api/appointments', requireAuth, applyRoleBasedFiltering, (req, res) => {
  try {
    let appointments;
    
    // Use the data filter set by applyRoleBasedFiltering middleware
    if (req.dataFilter.type === 'admin') {
      appointments = database.getAllAppointments();
    } else if (req.dataFilter.type === 'patient') {
      appointments = database.getAppointmentsByEmail(req.dataFilter.email);
    } else {
      return res.status(403).json({ 
        error: 'Invalid data filter',
        message: 'Unable to determine data access level'
      });
    }
    
    res.json({ 
      appointments,
      userRole: req.user.role,
      totalCount: appointments.length
    });
  } catch (error) {
    console.error('Error en /api/appointments:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/appointments/my - Get current user's appointments (patient-specific)
 */
app.get('/api/appointments/my', requireAuth, applyRoleBasedFiltering, (req, res) => {
  try {
    let appointments;
    
    // Use the data filter set by applyRoleBasedFiltering middleware
    if (req.dataFilter.type === 'admin') {
      // Admin users get all appointments when accessing /my endpoint
      appointments = database.getAllAppointments();
    } else if (req.dataFilter.type === 'patient') {
      // Patient users get only their own appointments
      appointments = database.getAppointmentsByEmail(req.dataFilter.email);
    } else {
      return res.status(403).json({ 
        error: 'Invalid data filter',
        message: 'Unable to determine data access level'
      });
    }
    
    // Add additional metadata for patient view
    const appointmentsWithStatus = appointments.map(appt => {
      const appointmentDate = new Date(appt.date + 'T' + appt.time);
      const now = new Date();
      const isPast = appointmentDate < now;
      const isToday = appt.date === now.toISOString().split('T')[0];
      const isUpcoming = appointmentDate > now;
      
      return {
        ...appt,
        status: isPast ? 'completed' : isToday ? 'today' : 'upcoming',
        isPast,
        isToday,
        isUpcoming
      };
    });
    
    res.json({ 
      appointments: appointmentsWithStatus,
      userRole: req.user.role,
      userEmail: req.user.email,
      totalCount: appointmentsWithStatus.length,
      summary: {
        total: appointmentsWithStatus.length,
        upcoming: appointmentsWithStatus.filter(a => a.isUpcoming).length,
        today: appointmentsWithStatus.filter(a => a.isToday).length,
        completed: appointmentsWithStatus.filter(a => a.isPast).length
      }
    });
  } catch (error) {
    console.error('Error en /api/appointments/my:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stats - Estadísticas del sistema (solo admin)
 */
app.get('/api/stats', requireAuth, requireAdmin, (req, res) => {
  try {
    const stats = database.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error en /api/stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN DASHBOARD ENDPOINTS
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/admin/dashboard - Dashboard statistics (Admin only)
 */
app.get('/api/admin/dashboard', requireAuth, requireAdmin, (req, res) => {
  try {
    const { days, upcomingDays, recentLimit } = req.query;
    
    const options = {
      days: days ? parseInt(days) : 30,
      upcomingDays: upcomingDays ? parseInt(upcomingDays) : 7,
      recentLimit: recentLimit ? parseInt(recentLimit) : 10
    };
    
    const dashboardData = statsService.getDashboardData(options);
    
    res.json(dashboardData);
  } catch (error) {
    console.error('Error en /api/admin/dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/stats/appointments-by-day - Daily appointment statistics (Admin only)
 */
app.get('/api/admin/stats/appointments-by-day', requireAuth, requireAdmin, (req, res) => {
  try {
    const { days = 30 } = req.query;
    const appointmentsByDay = statsService.getAppointmentsByDay(parseInt(days));
    
    const now = new Date();
    const daysAgo = new Date(now.getTime() - (parseInt(days) * 24 * 60 * 60 * 1000));
    
    res.json({
      appointmentsByDay,
      totalDays: parseInt(days),
      dateRange: {
        from: daysAgo.toISOString().split('T')[0],
        to: now.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error en /api/admin/stats/appointments-by-day:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/stats/appointments-by-service - Service-based appointment statistics (Admin only)
 */
app.get('/api/admin/stats/appointments-by-service', requireAuth, requireAdmin, (req, res) => {
  try {
    const serviceData = statsService.getAppointmentsByService();
    
    res.json(serviceData);
  } catch (error) {
    console.error('Error en /api/admin/stats/appointments-by-service:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN REMINDER MANAGEMENT ENDPOINTS
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/admin/reminders/pending - Get pending reminders (Admin only)
 */
app.get('/api/admin/reminders/pending', requireAuth, requireAdmin, (req, res) => {
  try {
    const reminders = database.getAllReminders();
    const pendingReminders = reminders.filter(r => r.sent !== 1);
    
    res.json({
      pendingReminders,
      count: pendingReminders.length,
      totalReminders: reminders.length
    });
  } catch (error) {
    console.error('Error en /api/admin/reminders/pending:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/reminders/send-now - Manually trigger reminder sending (Admin only)
 */
app.post('/api/admin/reminders/send-now', requireAuth, requireAdmin, doubleCsrfProtection, async (req, res) => {
  try {
    const { reminderId } = req.body;
    
    if (reminderId) {
      // Send specific reminder
      const reminder = database.getReminderById(reminderId);
      if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found' });
      }
      
      if (reminder.sent === 1) {
        return res.status(400).json({ error: 'Reminder already sent' });
      }
      
      // Send the reminder
      try {
        await notificationService.sendReminder(reminder);
        database.markReminderAsSent(reminderId);
        
        res.json({
          success: true,
          message: 'Reminder sent successfully',
          reminderId
        });
      } catch (sendError) {
        console.error('Failed to send reminder:', sendError);
        res.status(500).json({ 
          error: 'Failed to send reminder',
          message: sendError.message 
        });
      }
    } else {
      // Send all pending reminders
      const reminders = database.getAllReminders();
      const pendingReminders = reminders.filter(r => r.sent !== 1);
      
      let sentCount = 0;
      let failedCount = 0;
      const results = [];
      
      for (const reminder of pendingReminders) {
        try {
          await notificationService.sendReminder(reminder);
          database.markReminderAsSent(reminder.id);
          sentCount++;
          results.push({ id: reminder.id, status: 'sent' });
        } catch (sendError) {
          failedCount++;
          results.push({ id: reminder.id, status: 'failed', error: sendError.message });
        }
      }
      
      res.json({
        success: true,
        message: `Processed ${pendingReminders.length} reminders`,
        results: {
          sent: sentCount,
          failed: failedCount,
          details: results
        }
      });
    }
  } catch (error) {
    console.error('Error en /api/admin/reminders/send-now:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/reminders/history - Get reminder history (Admin only)
 */
app.get('/api/admin/reminders/history', requireAuth, requireAdmin, (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const reminders = database.getAllReminders();
    
    // Sort by creation date (newest first)
    const sortedReminders = reminders.sort((a, b) => {
      const dateA = new Date(a.sent_at || a.created_at || 0);
      const dateB = new Date(b.sent_at || b.created_at || 0);
      return dateB - dateA;
    });
    
    const paginatedReminders = sortedReminders.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      success: true,
      reminders: paginatedReminders,
      total: reminders.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error en /api/admin/reminders/history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/notifications/send-cancellation - Send cancellation notifications (Admin only)
 */
app.post('/api/admin/notifications/send-cancellation', requireAuth, requireAdmin, doubleCsrfProtection, async (req, res) => {
  try {
    const { appointments } = req.body;
    
    if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un array de citas para cancelar',
        message: 'Proporciona las citas en el formato: [{ name, email, phone, date, time, service, lang }]'
      });
    }
    
    console.log(`[${new Date().toISOString()}] 📤 Iniciando envío de ${appointments.length} notificaciones de cancelación`);
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const appointment of appointments) {
      try {
        // Validar campos requeridos
        if (!appointment.name || !appointment.email || !appointment.service) {
          results.push({
            appointment: appointment.name || 'Sin nombre',
            success: false,
            error: 'Faltan campos requeridos (name, email, service)'
          });
          errorCount++;
          continue;
        }
        
        // Enviar notificación de cancelación
        const notificationResult = await notificationService.notifyAppointmentCancelled(appointment);
        
        const success = notificationResult.email.success || notificationResult.whatsapp.success;
        
        results.push({
          appointment: appointment.name,
          email: appointment.email,
          success: success,
          emailSent: notificationResult.email.success,
          whatsappSent: notificationResult.whatsapp.success,
          whatsappSkipped: notificationResult.whatsapp.skipped || false,
          error: success ? null : 'Falló tanto email como WhatsApp'
        });
        
        if (success) {
          successCount++;
          console.log(`[${new Date().toISOString()}] ✅ Notificación enviada a ${appointment.name}`);
        } else {
          errorCount++;
          console.log(`[${new Date().toISOString()}] ❌ Error enviando notificación a ${appointment.name}`);
        }
        
        // Pausa de 1 segundo entre envíos para evitar spam
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error procesando ${appointment.name}:`, error);
        results.push({
          appointment: appointment.name || 'Sin nombre',
          success: false,
          error: error.message
        });
        errorCount++;
      }
    }
    
    console.log(`[${new Date().toISOString()}] 📊 Proceso completado: ${successCount} exitosas, ${errorCount} fallidas`);
    
    res.json({
      success: true,
      message: `Proceso completado: ${successCount} notificaciones enviadas, ${errorCount} fallidas`,
      summary: {
        total: appointments.length,
        successful: successCount,
        failed: errorCount
      },
      results: results
    });
    
  } catch (error) {
    console.error('Error en /api/admin/notifications/send-cancellation:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN BACKUP MANAGEMENT ENDPOINTS
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/admin/backups - List available backup files (Admin only)
 */
app.get('/api/admin/backups', requireAuth, requireAdmin, (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const backupDir = '/home/medicare/backups/';
    const localBackupDir = path.join(__dirname, '..', '..', 'backups'); // Fallback for local development
    
    let backupPath = backupDir;
    if (!fs.existsSync(backupDir) && fs.existsSync(localBackupDir)) {
      backupPath = localBackupDir;
    }
    
    if (!fs.existsSync(backupPath)) {
      return res.json({
        backups: [],
        message: 'Backup directory not found',
        backupPath
      });
    }
    
    const files = fs.readdirSync(backupPath);
    const backupFiles = files
      .filter(file => file.endsWith('.tar.gz') && file.startsWith('backup-'))
      .map(file => {
        const filePath = path.join(backupPath, file);
        const stats = fs.statSync(filePath);
        
        return {
          filename: file,
          size: stats.size,
          sizeFormatted: formatBytes(stats.size),
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
          path: filePath
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    
    res.json({
      backups: backupFiles,
      count: backupFiles.length,
      backupPath,
      totalSize: backupFiles.reduce((sum, file) => sum + file.size, 0)
    });
  } catch (error) {
    console.error('Error en /api/admin/backups:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/backups/create-now - Create backup immediately (Admin only)
 */
app.post('/api/admin/backups/create-now', requireAuth, requireAdmin, doubleCsrfProtection, async (req, res) => {
  try {
    const { exec } = require('child_process');
    const path = require('path');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('-').split('.')[0];
    const backupFilename = `backup-${timestamp}.tar.gz`;
    
    const dataDir = path.join(__dirname, '..', '..', 'clinica-ai', 'data');
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    const backupPath = path.join(backupDir, backupFilename);
    
    // Ensure backup directory exists
    const fs = require('fs');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Create backup using tar command
    const command = `tar -czf "${backupPath}" -C "${path.dirname(dataDir)}" "${path.basename(dataDir)}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Backup creation failed:', error);
        return res.status(500).json({ 
          error: 'Backup creation failed',
          message: error.message,
          stderr
        });
      }
      
      // Verify backup file was created
      if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath);
        
        res.json({
          success: true,
          message: 'Backup created successfully',
          backup: {
            filename: backupFilename,
            path: backupPath,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            created: stats.birthtime.toISOString()
          }
        });
      } else {
        res.status(500).json({ 
          error: 'Backup file not found after creation',
          command
        });
      }
    });
  } catch (error) {
    console.error('Error en /api/admin/backups/create-now:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/backups/restore - Restore from backup (Admin only)
 */
app.post('/api/admin/backups/restore', requireAuth, requireAdmin, doubleCsrfProtection, async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Backup filename is required' });
    }
    
    const { exec } = require('child_process');
    const path = require('path');
    const fs = require('fs');
    
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    const backupPath = path.join(backupDir, filename);
    const dataDir = path.join(__dirname, '..', '..', 'clinica-ai', 'data');
    
    // Verify backup file exists
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }
    
    // Create backup of current data before restore
    const currentBackupFilename = `pre-restore-${new Date().toISOString().replace(/[:.]/g, '-').split('T').join('-').split('.')[0]}.tar.gz`;
    const currentBackupPath = path.join(backupDir, currentBackupFilename);
    
    const backupCurrentCommand = `tar -czf "${currentBackupPath}" -C "${path.dirname(dataDir)}" "${path.basename(dataDir)}"`;
    
    exec(backupCurrentCommand, (backupError) => {
      if (backupError) {
        console.error('Failed to backup current data:', backupError);
        return res.status(500).json({ 
          error: 'Failed to backup current data before restore',
          message: backupError.message
        });
      }
      
      // Now restore from the selected backup
      const restoreCommand = `tar -xzf "${backupPath}" -C "${path.dirname(dataDir)}"`;
      
      exec(restoreCommand, (restoreError, stdout, stderr) => {
        if (restoreError) {
          console.error('Restore failed:', restoreError);
          return res.status(500).json({ 
            error: 'Restore failed',
            message: restoreError.message,
            stderr
          });
        }
        
        res.json({
          success: true,
          message: 'Data restored successfully',
          restoredFrom: filename,
          currentDataBackup: currentBackupFilename,
          warning: 'Server restart may be required for changes to take effect'
        });
      });
    });
  } catch (error) {
    console.error('Error en /api/admin/backups/restore:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * GET /api/search - Búsqueda vectorial semántica (con filtrado por rol)
 */
app.get('/api/search', requireAuth, applyRoleBasedFiltering, (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Se requiere el parámetro q' });
    }
    
    let results = database.searchAppointments(q);
    
    // Filter results based on user role using the data filter
    if (req.dataFilter.type === 'patient') {
      results = results.filter(appointment => appointment.email === req.dataFilter.email);
    }
    
    res.json({ 
      results,
      userRole: req.user.role,
      query: q,
      totalResults: results.length
    });
  } catch (error) {
    console.error('Error en /api/search:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/appointments/:id - Cancela una cita (con control de acceso)
 */
app.delete('/api/appointments/:id', requireAuth, requireAppointmentAccess, doubleCsrfProtection, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener la cita antes de eliminarla (already validated by requireAppointmentAccess)
    const appointment = database.getAppointmentById(id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    
    // Enviar notificaciones de cancelación (async, no bloquea)
    notificationService.notifyAppointmentCancelled(appointment)
      .catch(err => console.error('Cancellation notification error:', err));
    
    // Eliminar la cita
    const deleted = database.deleteAppointment(id);
    
    if (deleted) {
      res.json({ 
        success: true, 
        message: 'Cita cancelada exitosamente',
        appointmentId: id,
        userRole: req.user.role
      });
    } else {
      res.status(500).json({ error: 'No se pudo eliminar la cita' });
    }
  } catch (error) {
    console.error('Error en DELETE /api/appointments/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV
  });
});

/**
 * GET /api/debug - Debug endpoint (solo para desarrollo)
 */
app.get('/api/debug', async (req, res) => {
  try {
    // Permitir solo con parámetro force
    if (!req.query.force) {
      return res.status(403).json({ error: 'Debug endpoint requires force parameter' });
    }
    
    const database = require('./database-postgres');
    
    // Test 1: Verificar conexión a base de datos
    const dbTest = await database.testConnection();
    
    // Test 2: Contar usuarios
    const userCount = await database.getUserCount();
    
    // Test 3: Listar usuarios (sin contraseñas)
    const users = await database.getAllUsersDebug();
    
    // Test 4: Verificar variables de entorno
    const envCheck = {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      DB_SSL: process.env.DB_SSL,
      NODE_ENV: process.env.NODE_ENV
    };
    
    res.json({
      success: true,
      debug: {
        database: dbTest,
        userCount,
        users,
        environment: envCheck,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ 
      error: 'Debug failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/health - Health check endpoint for API
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'medicare-ai-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'postgresql',
    version: '2.0.0'
  });
});

// Ruta principal - acceso público (no requiere autenticación)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Ruta para index.html - acceso público (no requiere autenticación)
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  // Determinar qué IA está configurada
  let iaStatus = 'Modo DEMO';
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('demo') && !process.env.GROQ_API_KEY.includes('xxxxxxxx')) {
    iaStatus = 'Groq Llama 3 (Gratis)';
  } else if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('demo') && !process.env.OPENAI_API_KEY.includes('xxxxxxxx')) {
    iaStatus = 'OpenAI GPT-3.5 Turbo';
  }
  
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✦ MediCare AI - Sistema de Citas Clínicas con IA       ║
║                                                           ║
║   🚀 Servidor corriendo en: http://localhost:${PORT}       ║
║   🤖 IA: ${iaStatus}                                    ║
║   📧 Email: ${process.env.SMTP_HOST || 'Modo DEMO'}      ║
║   💬 WhatsApp: ${process.env.TWILIO_ACCOUNT_SID ? 'Configurado' : 'Modo DEMO'} ║
║   🗄️  Base de datos: JSON (archivos locales)            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
