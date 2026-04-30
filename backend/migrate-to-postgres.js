/**
 * ═══════════════════════════════════════════════════════════════
 * Script de Migración: JSON → PostgreSQL
 * Migra datos existentes de archivos JSON a PostgreSQL
 * ═══════════════════════════════════════════════════════════════
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Configuración de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Rutas de archivos JSON
const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const REMINDERS_FILE = path.join(DATA_DIR, 'reminders.json');

/**
 * Leer archivo JSON
 */
function readJSONFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`Error leyendo ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Migrar usuarios
 */
async function migrateUsers() {
  console.log('\n📊 Migrando usuarios...');
  
  const users = readJSONFile(USERS_FILE);
  
  if (users.length === 0) {
    console.log('⚠️  No hay usuarios para migrar');
    return 0;
  }
  
  let migrated = 0;
  
  for (const user of users) {
    try {
      await pool.query(
        `INSERT INTO users (id, username, email, password, role, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (username) DO NOTHING`,
        [
          user.id,
          user.username,
          user.email,
          user.password,
          user.role || 'patient',
          user.created_at || new Date().toISOString()
        ]
      );
      migrated++;
      console.log(`  ✅ Usuario migrado: ${user.username}`);
    } catch (error) {
      console.error(`  ❌ Error migrando usuario ${user.username}:`, error.message);
    }
  }
  
  // Actualizar secuencia de IDs
  await pool.query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))`);
  
  console.log(`✅ ${migrated}/${users.length} usuarios migrados`);
  return migrated;
}

/**
 * Migrar citas
 */
async function migrateAppointments() {
  console.log('\n📊 Migrando citas...');
  
  const appointments = readJSONFile(APPOINTMENTS_FILE);
  
  if (appointments.length === 0) {
    console.log('⚠️  No hay citas para migrar');
    return 0;
  }
  
  let migrated = 0;
  
  for (const apt of appointments) {
    try {
      await pool.query(
        `INSERT INTO appointments 
         (id, name, email, phone, date, time, service, notes, ai_confirmation, lang, status, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          apt.id,
          apt.name,
          apt.email,
          apt.phone || null,
          apt.date,
          apt.time,
          apt.service,
          apt.notes || '',
          apt.ai_confirmation || '',
          apt.lang || 'es',
          apt.status || 'scheduled',
          apt.created_at || new Date().toISOString()
        ]
      );
      migrated++;
      console.log(`  ✅ Cita migrada: ${apt.name} - ${apt.date}`);
    } catch (error) {
      console.error(`  ❌ Error migrando cita ${apt.id}:`, error.message);
    }
  }
  
  // Actualizar secuencia de IDs
  await pool.query(`SELECT setval('appointments_id_seq', (SELECT MAX(id) FROM appointments))`);
  
  console.log(`✅ ${migrated}/${appointments.length} citas migradas`);
  return migrated;
}

/**
 * Migrar recordatorios
 */
async function migrateReminders() {
  console.log('\n📊 Migrando recordatorios...');
  
  const reminders = readJSONFile(REMINDERS_FILE);
  
  if (reminders.length === 0) {
    console.log('⚠️  No hay recordatorios para migrar');
    return 0;
  }
  
  let migrated = 0;
  
  for (const reminder of reminders) {
    try {
      await pool.query(
        `INSERT INTO reminders 
         (id, appointment_id, name, service, date, lang, message, auto, sent, sent_at, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          reminder.id,
          reminder.appointment_id || null,
          reminder.name,
          reminder.service,
          reminder.date,
          reminder.lang || 'es',
          reminder.message,
          reminder.auto || false,
          reminder.sent === 1 || reminder.sent === true,
          reminder.sent_at || null,
          reminder.created_at || new Date().toISOString()
        ]
      );
      migrated++;
      console.log(`  ✅ Recordatorio migrado: ${reminder.name} - ${reminder.date}`);
    } catch (error) {
      console.error(`  ❌ Error migrando recordatorio ${reminder.id}:`, error.message);
    }
  }
  
  // Actualizar secuencia de IDs
  await pool.query(`SELECT setval('reminders_id_seq', (SELECT MAX(id) FROM reminders))`);
  
  console.log(`✅ ${migrated}/${reminders.length} recordatorios migrados`);
  return migrated;
}

/**
 * Verificar migración
 */
async function verifyMigration() {
  console.log('\n🔍 Verificando migración...');
  
  try {
    const [users, appointments, reminders] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM appointments'),
      pool.query('SELECT COUNT(*) as count FROM reminders')
    ]);
    
    console.log('\n📊 Resumen de la base de datos:');
    console.log(`  👥 Usuarios: ${users.rows[0].count}`);
    console.log(`  📅 Citas: ${appointments.rows[0].count}`);
    console.log(`  ⏰ Recordatorios: ${reminders.rows[0].count}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error verificando migración:', error.message);
    return false;
  }
}

/**
 * Ejecutar migración completa
 */
async function runMigration() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🚀 Migración JSON → PostgreSQL');
  console.log('  MediCare AI Database Migration');
  console.log('═══════════════════════════════════════════════════════════════');
  
  try {
    // Test de conexión
    console.log('\n🔌 Probando conexión a PostgreSQL...');
    const testResult = await pool.query('SELECT NOW()');
    console.log(`✅ Conectado a PostgreSQL: ${testResult.rows[0].now}`);
    
    // Ejecutar migraciones
    const usersCount = await migrateUsers();
    const appointmentsCount = await migrateAppointments();
    const remindersCount = await migrateReminders();
    
    // Verificar
    await verifyMigration();
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  ✅ Migración completada exitosamente');
    console.log(`  📊 Total migrado: ${usersCount + appointmentsCount + remindersCount} registros`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
