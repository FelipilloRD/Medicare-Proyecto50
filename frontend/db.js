// Base de datos vectorial en localStorage (VectorDB)
// Almacena citas localmente para búsqueda rápida

const DB_KEY = 'medicare_appointments';

/**
 * Guarda una cita en localStorage
 */
function saveAppointment(appointment) {
  const appointments = getAllAppointments();
  appointments.push(appointment);
  localStorage.setItem(DB_KEY, JSON.stringify(appointments));
}

/**
 * Obtiene todas las citas de localStorage
 */
function getAllAppointments() {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * Busca citas por texto
 */
function searchAppointments(query) {
  const appointments = getAllAppointments();
  const lowerQuery = query.toLowerCase();
  
  return appointments.filter(appt => {
    return (
      appt.name.toLowerCase().includes(lowerQuery) ||
      appt.service.toLowerCase().includes(lowerQuery) ||
      (appt.notes && appt.notes.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Limpia todas las citas
 */
function clearAppointments() {
  localStorage.removeItem(DB_KEY);
}

// Exportar funciones
window.db = {
  saveAppointment,
  getAllAppointments,
  searchAppointments,
  clearAppointments
};
