const path = require('path');
const fs = require('fs');

// Asegurar que existe el directorio data
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const appointmentsFile = path.join(dataDir, 'appointments.json');
const remindersFile = path.join(dataDir, 'reminders.json');

// Inicializar archivos si no existen
if (!fs.existsSync(appointmentsFile)) {
  fs.writeFileSync(appointmentsFile, JSON.stringify([]));
}
if (!fs.existsSync(remindersFile)) {
  fs.writeFileSync(remindersFile, JSON.stringify([]));
}

// Funciones auxiliares para leer/escribir JSON
function readAppointments() {
  const data = fs.readFileSync(appointmentsFile, 'utf8');
  return JSON.parse(data);
}

function writeAppointments(appointments) {
  fs.writeFileSync(appointmentsFile, JSON.stringify(appointments, null, 2));
}

function readReminders() {
  const data = fs.readFileSync(remindersFile, 'utf8');
  return JSON.parse(data);
}

function writeReminders(reminders) {
  fs.writeFileSync(remindersFile, JSON.stringify(reminders, null, 2));
}

let appointmentIdCounter = 1;
let reminderIdCounter = 1;

// Inicializar contadores
const existingAppointments = readAppointments();
const existingReminders = readReminders();
if (existingAppointments.length > 0) {
  appointmentIdCounter = Math.max(...existingAppointments.map(a => a.id)) + 1;
}
if (existingReminders.length > 0) {
  reminderIdCounter = Math.max(...existingReminders.map(r => r.id)) + 1;
}

// Keywords médicas para embeddings vectoriales
const MEDICAL_KEYWORDS = [
  'consulta', 'cardiología', 'pediatría', 'dermatología', 'laboratorio',
  'rayos x', 'odontología', 'psicología', 'emergencia', 'cita', 'doctor',
  'médico', 'paciente', 'tratamiento', 'diagnóstico', 'examen', 'análisis'
];

/**
 * Genera un embedding vectorial simple basado en TF (Term Frequency)
 */
function generateVector(text) {
  const normalized = text.toLowerCase();
  const vector = MEDICAL_KEYWORDS.map(keyword => {
    const regex = new RegExp(keyword, 'gi');
    const matches = normalized.match(regex);
    return matches ? matches.length : 0;
  });
  return JSON.stringify(vector);
}

/**
 * Calcula similitud coseno entre dos vectores
 */
function cosineSimilarity(vec1, vec2) {
  const v1 = JSON.parse(vec1);
  const v2 = JSON.parse(vec2);
  
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    mag1 += v1[i] * v1[i];
    mag2 += v2[i] * v2[i];
  }
  
  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);
  
  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (mag1 * mag2);
}

/**
 * Crea una nueva cita
 */
function createAppointment(data) {
  const appointments = readAppointments();
  const vector = generateVector(`${data.service} ${data.notes || ''}`);
  
  const appointment = {
    id: appointmentIdCounter++,
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    date: data.date,
    time: data.time,
    service: data.service,
    notes: data.notes || null,
    ai_confirmation: data.ai_confirmation || null,
    lang: data.lang || 'es',
    vector: vector,
    created_at: new Date().toISOString()
  };
  
  appointments.push(appointment);
  writeAppointments(appointments);
  
  return appointment;
}

/**
 * Obtiene todas las citas
 */
function getAllAppointments() {
  return readAppointments().sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

/**
 * Obtiene citas filtradas por email (para pacientes)
 */
function getAppointmentsByEmail(email) {
  const appointments = readAppointments();
  return appointments
    .filter(a => a.email === email)
    .sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });
}

/**
 * Obtiene una cita por ID
 */
function getAppointmentById(id) {
  const appointments = readAppointments();
  return appointments.find(a => a.id === parseInt(id));
}

/**
 * Elimina una cita
 */
function deleteAppointment(id) {
  const appointments = readAppointments();
  const reminders = readReminders();
  
  const filteredAppointments = appointments.filter(a => a.id !== parseInt(id));
  const filteredReminders = reminders.filter(r => r.appointment_id !== parseInt(id));
  
  writeAppointments(filteredAppointments);
  writeReminders(filteredReminders);
  
  return filteredAppointments.length < appointments.length;
}

/**
 * Búsqueda semántica por similitud vectorial
 */
function searchAppointments(query, limit = 10) {
  const queryVector = generateVector(query);
  const allAppointments = getAllAppointments();
  
  const results = allAppointments.map(appt => ({
    ...appt,
    similarity: cosineSimilarity(queryVector, appt.vector)
  }))
  .filter(appt => appt.similarity > 0)
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, limit);
  
  return results;
}

/**
 * Crea un recordatorio
 */
function createReminder(data) {
  const reminders = readReminders();
  
  const reminder = {
    id: reminderIdCounter++,
    appointment_id: data.appointment_id || null,
    name: data.name,
    service: data.service,
    date: data.date,
    lang: data.lang || 'es',
    message: data.message,
    auto: data.auto ? 1 : 0,
    sent: 0,
    sent_at: null,
    created_at: new Date().toISOString(),
    created_by: data.created_by || null
  };
  
  reminders.push(reminder);
  writeReminders(reminders);
  
  return reminder;
}

/**
 * Obtiene recordatorios pendientes (no enviados)
 */
function getPendingReminders() {
  const reminders = readReminders();
  const appointments = readAppointments();
  
  return reminders
    .filter(r => r.sent === 0)
    .map(r => {
      const appt = appointments.find(a => a.id === r.appointment_id);
      return {
        ...r,
        email: appt ? appt.email : null,
        phone: appt ? appt.phone : null
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Marca un recordatorio como enviado
 */
function markReminderAsSent(id) {
  const reminders = readReminders();
  const reminder = reminders.find(r => r.id === parseInt(id));
  
  if (reminder) {
    reminder.sent = 1;
    reminder.sent_at = new Date().toISOString();
    writeReminders(reminders);
    return true;
  }
  
  return false;
}

/**
 * Obtiene citas para recordatorios (24h antes)
 */
function getAppointmentsForReminders() {
  const appointments = readAppointments();
  const reminders = readReminders();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  return appointments.filter(appt => {
    const apptDate = appt.date;
    const hasAutoReminder = reminders.some(r => 
      r.appointment_id === appt.id && r.auto === 1 && r.sent === 1
    );
    return apptDate === tomorrowStr && !hasAutoReminder;
  });
}

/**
 * Obtiene estadísticas del sistema
 */
function getStats() {
  const appointments = readAppointments();
  const reminders = readReminders();
  
  return {
    totalAppointments: appointments.length,
    totalReminders: reminders.length,
    sentReminders: reminders.filter(r => r.sent === 1).length,
    pendingReminders: reminders.filter(r => r.sent === 0).length
  };
}

/**
 * Obtiene todos los recordatorios
 */
function getAllReminders() {
  return readReminders().sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

/**
 * Obtiene un recordatorio por ID
 */
function getReminderById(id) {
  const reminders = readReminders();
  return reminders.find(r => r.id === parseInt(id));
}

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentsByEmail,
  getAppointmentById,
  deleteAppointment,
  searchAppointments,
  createReminder,
  getPendingReminders,
  markReminderAsSent,
  getAppointmentsForReminders,
  getStats,
  getAllReminders,
  getReminderById
};
