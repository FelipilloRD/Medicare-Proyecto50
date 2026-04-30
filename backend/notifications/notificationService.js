const emailService = require('./emailService');
const whatsappService = require('./whatsappService');
const database = require('../database-postgres');

/**
 * Orquestador de notificaciones - envía Email y WhatsApp en paralelo
 * Usa Promise.allSettled para que si uno falla, el otro igual se envíe
 */

/**
 * Notifica la creación de una cita (confirmación)
 */
async function notifyAppointmentCreated(appointment, aiConfirmationText) {
  console.log(`[${new Date().toISOString()}] 📤 Sending notifications for appointment #${appointment.id} (${appointment.name})`);
  
  const results = await Promise.allSettled([
    emailService.sendAppointmentConfirmation(appointment, aiConfirmationText),
    whatsappService.sendWhatsAppConfirmation(appointment, aiConfirmationText)
  ]);
  
  const emailResult = results[0];
  const whatsappResult = results[1];
  
  // Log resultados
  if (emailResult.status === 'fulfilled' && emailResult.value.success) {
    console.log(`[${new Date().toISOString()}] ✅ Email sent successfully`);
  } else {
    console.error(`[${new Date().toISOString()}] ❌ Email failed:`, emailResult.reason || emailResult.value?.error);
  }
  
  if (whatsappResult.status === 'fulfilled' && whatsappResult.value.success) {
    console.log(`[${new Date().toISOString()}] ✅ WhatsApp sent successfully`);
  } else if (whatsappResult.status === 'fulfilled' && whatsappResult.value.skipped) {
    console.log(`[${new Date().toISOString()}] ⚠️ WhatsApp skipped: ${whatsappResult.value.reason}`);
  } else {
    console.error(`[${new Date().toISOString()}] ❌ WhatsApp failed:`, whatsappResult.reason || whatsappResult.value?.error);
  }
  
  return {
    email: emailResult.status === 'fulfilled' ? emailResult.value : { success: false },
    whatsapp: whatsappResult.status === 'fulfilled' ? whatsappResult.value : { success: false }
  };
}

/**
 * Notifica un recordatorio de cita (24h antes)
 */
async function notifyAppointmentReminder(appointment, reminderText) {
  console.log(`[${new Date().toISOString()}] 📤 Sending reminder for appointment #${appointment.id} (${appointment.name})`);
  
  const results = await Promise.allSettled([
    emailService.sendAppointmentReminder(appointment, reminderText),
    whatsappService.sendWhatsAppReminder(appointment, reminderText)
  ]);
  
  const emailResult = results[0];
  const whatsappResult = results[1];
  
  // Log resultados
  if (emailResult.status === 'fulfilled' && emailResult.value.success) {
    console.log(`[${new Date().toISOString()}] ✅ Email reminder sent`);
  } else {
    console.error(`[${new Date().toISOString()}] ❌ Email reminder failed:`, emailResult.reason || emailResult.value?.error);
  }
  
  if (whatsappResult.status === 'fulfilled' && whatsappResult.value.success) {
    console.log(`[${new Date().toISOString()}] ✅ WhatsApp reminder sent`);
  } else if (whatsappResult.status === 'fulfilled' && whatsappResult.value.skipped) {
    console.log(`[${new Date().toISOString()}] ⚠️ WhatsApp reminder skipped: ${whatsappResult.value.reason}`);
  } else {
    console.error(`[${new Date().toISOString()}] ❌ WhatsApp reminder failed:`, whatsappResult.reason || whatsappResult.value?.error);
  }
  
  // Marcar recordatorio como enviado si al menos uno fue exitoso
  const anySuccess = (emailResult.status === 'fulfilled' && emailResult.value.success) ||
                     (whatsappResult.status === 'fulfilled' && whatsappResult.value.success);
  
  return {
    email: emailResult.status === 'fulfilled' ? emailResult.value : { success: false },
    whatsapp: whatsappResult.status === 'fulfilled' ? whatsappResult.value : { success: false },
    anySuccess
  };
}

/**
 * Notifica la cancelación de una cita
 */
async function notifyAppointmentCancelled(appointment) {
  console.log(`[${new Date().toISOString()}] 📤 Sending cancellation for appointment #${appointment.id} (${appointment.name})`);
  
  const results = await Promise.allSettled([
    emailService.sendAppointmentCancellation(appointment),
    whatsappService.sendWhatsAppCancellation(appointment)
  ]);
  
  const emailResult = results[0];
  const whatsappResult = results[1];
  
  // Log resultados
  if (emailResult.status === 'fulfilled' && emailResult.value.success) {
    console.log(`[${new Date().toISOString()}] ✅ Email cancellation sent`);
  } else {
    console.error(`[${new Date().toISOString()}] ❌ Email cancellation failed:`, emailResult.reason || emailResult.value?.error);
  }
  
  if (whatsappResult.status === 'fulfilled' && whatsappResult.value.success) {
    console.log(`[${new Date().toISOString()}] ✅ WhatsApp cancellation sent`);
  } else if (whatsappResult.status === 'fulfilled' && whatsappResult.value.skipped) {
    console.log(`[${new Date().toISOString()}] ⚠️ WhatsApp cancellation skipped: ${whatsappResult.value.reason}`);
  } else {
    console.error(`[${new Date().toISOString()}] ❌ WhatsApp cancellation failed:`, whatsappResult.reason || whatsappResult.value?.error);
  }
  
  return {
    email: emailResult.status === 'fulfilled' ? emailResult.value : { success: false },
    whatsapp: whatsappResult.status === 'fulfilled' ? whatsappResult.value : { success: false }
  };
}

/**
 * Envía un recordatorio específico (para uso manual desde admin)
 */
async function sendReminder(reminder) {
  console.log(`[${new Date().toISOString()}] 📤 Sending manual reminder #${reminder.id} (${reminder.name})`);
  
  // Get appointment details if available
  let appointment = null;
  if (reminder.appointment_id) {
    appointment = database.getAppointmentById(reminder.appointment_id);
  }
  
  // Create appointment-like object from reminder data
  const appointmentData = appointment || {
    id: reminder.appointment_id || reminder.id,
    name: reminder.name,
    email: reminder.email || 'unknown@example.com',
    phone: reminder.phone || null,
    date: reminder.date,
    time: reminder.time || '00:00',
    service: reminder.service,
    lang: reminder.lang || 'es'
  };
  
  const results = await Promise.allSettled([
    emailService.sendAppointmentReminder(appointmentData, reminder.message),
    whatsappService.sendWhatsAppReminder(appointmentData, reminder.message)
  ]);
  
  const emailResult = results[0];
  const whatsappResult = results[1];
  
  // Log resultados
  if (emailResult.status === 'fulfilled' && emailResult.value.success) {
    console.log(`[${new Date().toISOString()}] ✅ Manual reminder email sent`);
  } else {
    console.error(`[${new Date().toISOString()}] ❌ Manual reminder email failed:`, emailResult.reason || emailResult.value?.error);
  }
  
  if (whatsappResult.status === 'fulfilled' && whatsappResult.value.success) {
    console.log(`[${new Date().toISOString()}] ✅ Manual reminder WhatsApp sent`);
  } else if (whatsappResult.status === 'fulfilled' && whatsappResult.value.skipped) {
    console.log(`[${new Date().toISOString()}] ⚠️ Manual reminder WhatsApp skipped: ${whatsappResult.value.reason}`);
  } else {
    console.error(`[${new Date().toISOString()}] ❌ Manual reminder WhatsApp failed:`, whatsappResult.reason || whatsappResult.value?.error);
  }
  
  // Return success if at least one method succeeded
  const anySuccess = (emailResult.status === 'fulfilled' && emailResult.value.success) ||
                     (whatsappResult.status === 'fulfilled' && whatsappResult.value.success);
  
  if (!anySuccess) {
    throw new Error('Failed to send reminder via both email and WhatsApp');
  }
  
  return {
    email: emailResult.status === 'fulfilled' ? emailResult.value : { success: false },
    whatsapp: whatsappResult.status === 'fulfilled' ? whatsappResult.value : { success: false },
    anySuccess
  };
}

module.exports = {
  notifyAppointmentCreated,
  notifyAppointmentReminder,
  notifyAppointmentCancelled,
  sendReminder
};
