/**
 * ═══════════════════════════════════════════════════════════════
 * MediCare AI - PostgreSQL Database Module
 * Compatible con Supabase
 * ═══════════════════════════════════════════════════════════════
 */

const { Pool } = require('pg');

// Configuración de conexión PostgreSQL
const pool = new Pool({
  // Para Supabase, usar la connection string directamente:
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en PostgreSQL:', err);
});

// ═══════════════════════════════════════════════════════════════
// USERS - Gestión de usuarios
// ═══════════════════════════════════════════════════════════════

/**
 * Obtener usuario por username
 */
async function getUserByUsername(username) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
}

/**
 * Obtener usuario por email
 */
async function getUserByEmail(email) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

/**
 * Obtener usuario por ID
 */
async function getUserById(id) {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

/**
 * Crear nuevo usuario
 */
async function createUser(userData) {
  try {
    const { username, email, password, role = 'patient' } = userData;
    
    const result = await pool.query(
      `INSERT INTO users (username, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [username, email, password, role]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Obtener todos los usuarios
 */
async function getAllUsers() {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// APPOINTMENTS - Gestión de citas
// ═══════════════════════════════════════════════════════════════

/**
 * Crear nueva cita
 */
async function createAppointment(appointmentData) {
  try {
    const {
      name,
      email,
      phone,
      date,
      time,
      service,
      notes = '',
      ai_confirmation = '',
      lang = 'es',
      status = 'scheduled'
    } = appointmentData;
    
    const result = await pool.query(
      `INSERT INTO appointments 
       (name, email, phone, date, time, service, notes, ai_confirmation, lang, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [name, email, phone, date, time, service, notes, ai_confirmation, lang, status]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

/**
 * Obtener todas las citas
 */
async function getAllAppointments() {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments ORDER BY date DESC, time DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting all appointments:', error);
    throw error;
  }
}

/**
 * Obtener cita por ID
 */
async function getAppointmentById(id) {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting appointment by ID:', error);
    throw error;
  }
}

/**
 * Obtener citas por email
 */
async function getAppointmentsByEmail(email) {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments WHERE email = $1 ORDER BY date DESC, time DESC',
      [email]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting appointments by email:', error);
    throw error;
  }
}

/**
 * Actualizar cita
 */
async function updateAppointment(id, updates) {
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;
    
    // Construir query dinámicamente
    Object.keys(updates).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    });
    
    values.push(id);
    
    const result = await pool.query(
      `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
}

/**
 * Eliminar cita
 */
async function deleteAppointment(id) {
  try {
    const result = await pool.query(
      'DELETE FROM appointments WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] ? true : false;
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
}

/**
 * Buscar citas (búsqueda de texto completo)
 */
async function searchAppointments(query) {
  try {
    const result = await pool.query(
      `SELECT * FROM search_appointments($1)`,
      [query]
    );
    return result.rows;
  } catch (error) {
    console.error('Error searching appointments:', error);
    throw error;
  }
}

/**
 * Obtener citas próximas (siguientes N días)
 */
async function getUpcomingAppointments(days = 7) {
  try {
    const result = await pool.query(
      `SELECT * FROM appointments 
       WHERE date >= CURRENT_DATE 
       AND date <= CURRENT_DATE + $1 * INTERVAL '1 day'
       AND status = 'scheduled'
       ORDER BY date, time`,
      [days]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting upcoming appointments:', error);
    throw error;
  }
}

/**
 * Obtener citas recientes (últimos N registros)
 */
async function getRecentAppointments(limit = 10) {
  try {
    const result = await pool.query(
      `SELECT * FROM appointments 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting recent appointments:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// REMINDERS - Gestión de recordatorios
// ═══════════════════════════════════════════════════════════════

/**
 * Crear recordatorio
 */
async function createReminder(reminderData) {
  try {
    const {
      appointment_id = null,
      name,
      service,
      date,
      lang = 'es',
      message,
      auto = false,
      created_by = null
    } = reminderData;
    
    const result = await pool.query(
      `INSERT INTO reminders 
       (appointment_id, name, service, date, lang, message, auto, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [appointment_id, name, service, date, lang, message, auto, created_by]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating reminder:', error);
    throw error;
  }
}

/**
 * Obtener todos los recordatorios
 */
async function getAllReminders() {
  try {
    const result = await pool.query(
      'SELECT * FROM reminders ORDER BY date DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting all reminders:', error);
    throw error;
  }
}

/**
 * Obtener recordatorio por ID
 */
async function getReminderById(id) {
  try {
    const result = await pool.query(
      'SELECT * FROM reminders WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting reminder by ID:', error);
    throw error;
  }
}

/**
 * Marcar recordatorio como enviado
 */
async function markReminderAsSent(id) {
  try {
    const result = await pool.query(
      `UPDATE reminders 
       SET sent = true, sent_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error marking reminder as sent:', error);
    throw error;
  }
}

/**
 * Obtener recordatorios pendientes
 */
async function getPendingReminders() {
  try {
    const result = await pool.query(
      'SELECT * FROM pending_reminders'
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting pending reminders:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// STATISTICS - Estadísticas
// ═══════════════════════════════════════════════════════════════

/**
 * Obtener estadísticas generales
 */
async function getStats() {
  try {
    const [totalAppointments, totalUsers, totalReminders, upcomingAppointments] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM appointments'),
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM reminders'),
      pool.query(`SELECT COUNT(*) as count FROM appointments 
                  WHERE date >= CURRENT_DATE AND status = 'scheduled'`)
    ]);
    
    return {
      totalAppointments: parseInt(totalAppointments.rows[0].count),
      totalUsers: parseInt(totalUsers.rows[0].count),
      totalReminders: parseInt(totalReminders.rows[0].count),
      upcomingAppointments: parseInt(upcomingAppointments.rows[0].count)
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    throw error;
  }
}

/**
 * Obtener citas por servicio
 */
async function getAppointmentsByService() {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments_by_service'
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting appointments by service:', error);
    throw error;
  }
}

/**
 * Obtener citas por día (últimos N días)
 */
async function getAppointmentsByDay(days = 30) {
  try {
    const result = await pool.query(
      `SELECT 
         date,
         COUNT(*) as count
       FROM appointments
       WHERE date >= CURRENT_DATE - $1 * INTERVAL '1 day'
       GROUP BY date
       ORDER BY date DESC`,
      [days]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting appointments by day:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES - Utilidades
// ═══════════════════════════════════════════════════════════════

/**
 * Cerrar pool de conexiones (para shutdown graceful)
 */
async function closePool() {
  try {
    await pool.end();
    console.log('✅ Pool de PostgreSQL cerrado');
  } catch (error) {
    console.error('Error closing pool:', error);
    throw error;
  }
}

/**
 * Test de conexión
 */
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a PostgreSQL:', error.message);
    return false;
  }
}

/**
 * Get user count (for debugging)
 */
async function getUserCount() {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error getting user count:', error);
    throw error;
  }
}

/**
 * Get all users for debugging (without passwords)
 */
async function getAllUsersDebug() {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, LEFT(password, 20) || \'...\' as password_preview, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting all users debug:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // Users
  getUserByUsername,
  getUserByEmail,
  getUserById,
  createUser,
  getAllUsers,
  
  // Appointments
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByEmail,
  updateAppointment,
  deleteAppointment,
  searchAppointments,
  getUpcomingAppointments,
  getRecentAppointments,
  
  // Reminders
  createReminder,
  getAllReminders,
  getReminderById,
  markReminderAsSent,
  getPendingReminders,
  
  // Statistics
  getStats,
  getAppointmentsByService,
  getAppointmentsByDay,
  
  // Debug
  testConnection,
  getUserCount,
  getAllUsersDebug,
  
  // Utilities
  closePool,
  pool // Exportar pool para queries personalizadas
};