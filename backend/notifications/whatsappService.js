const twilio = require('twilio');

/**
 * Normaliza el número de teléfono al formato internacional
 */
function normalizePhoneNumber(phone) {
  if (!phone) return null;
  
  // Eliminar espacios y caracteres especiales
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si no tiene prefijo +, agregarlo
  if (!normalized.startsWith('+')) {
    // Asumir República Dominicana (+1809, +1829, +1849) si no tiene prefijo
    if (normalized.length === 10) {
      normalized = '+1' + normalized;
    } else if (normalized.length === 11 && normalized.startsWith('1')) {
      normalized = '+' + normalized;
    } else {
      normalized = '+' + normalized;
    }
  }
  
  return normalized;
}

/**
 * Valida si un número de teléfono es válido
 */
function isValidPhoneNumber(phone) {
  if (!phone) return false;
  const normalized = normalizePhoneNumber(phone);
  // Debe tener al menos 10 dígitos después del +
  return normalized && /^\+\d{10,15}$/.test(normalized);
}

/**
 * Crea el cliente de Twilio
 * Modo demo si no hay credenciales Twilio
 */
function createTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  // Modo demo si no hay credenciales Twilio
  if (!accountSid || accountSid === 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    console.log('⚠️  Modo demo - Sin credenciales Twilio');
    
    // Cliente simulado para demo
    return {
      messages: {
        create: async (messageData) => {
          console.log(`💬 [DEMO] WhatsApp enviado a: ${messageData.to}`);
          console.log(`💬 [DEMO] Mensaje: ${messageData.body.substring(0, 50)}...`);
          console.log('💬 [DEMO] WhatsApp simulado exitosamente');
          
          return {
            sid: `SM${Date.now()}`,
            status: 'sent',
            to: messageData.to,
            from: messageData.from
          };
        }
      }
    };
  }
  
  // Cliente real con Twilio
  return twilio(accountSid, authToken);
}

/**
 * Genera mensaje de WhatsApp de confirmación (versión profesional)
 */
function generateConfirmationMessage(appointment, aiMessage, lang = 'es') {
  const messages = {
    es: `🏥 *CONFIRMACIÓN DE CITA - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nEstimado/a ${appointment.name},\n\nSu cita médica ha sido confirmada exitosamente.\n\n� *DETALLES DE LA CITA:*\n• Servicio: ${appointment.service}\n• Fecha: ${appointment.date}\n• Hora: ${appointment.time}\n${appointment.notes ? `• Notas: ${appointment.notes}\n` : ''}\n� *INSTRUCCIONES:*\n- Llegar 15 minutos antes\n- Traer identificación oficial\n- Traer estudios previos (si aplica)\n\n📞 *CONTACTO:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n✉️ ${process.env.CLINIC_EMAIL || 'info@clinicamedicare.com'}\n\n*Gracias por confiar en nuestra institución médica.*`,
    
    en: `🏥 *APPOINTMENT CONFIRMATION - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nDear ${appointment.name},\n\nYour medical appointment has been successfully confirmed.\n\n� *APPOINTMENT DETAILS:*\n• Service: ${appointment.service}\n• Date: ${appointment.date}\n• Time: ${appointment.time}\n${appointment.notes ? `• Notes: ${appointment.notes}\n` : ''}\n� *INSTRUCTIONS:*\n- Arrive 15 minutes early\n- Bring official identification\n- Bring previous studies (if applicable)\n\n📞 *CONTACT:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n✉️ ${process.env.CLINIC_EMAIL || 'info@clinicamedicare.com'}\n\n*Thank you for trusting our medical institution.*`,
    
    fr: `🏥 *CONFIRMATION DE RENDEZ-VOUS - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nCher/Chère ${appointment.name},\n\nVotre rendez-vous médical a été confirmé avec succès.\n\n� *DÉTAILS DU RENDEZ-VOUS:*\n• Service: ${appointment.service}\n• Date: ${appointment.date}\n• Heure: ${appointment.time}\n${appointment.notes ? `• Notes: ${appointment.notes}\n` : ''}\n� *INSTRUCTIONS:*\n- Arriver 15 minutes à l'avance\n- Apporter une pièce d'identité officielle\n- Apporter les études précédentes (le cas échéant)\n\n📞 *CONTACT:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n✉️ ${process.env.CLINIC_EMAIL || 'info@clinicamedicare.com'}\n\n*Merci de faire confiance à notre institution médicale.*`,
    
    pt: `🏥 *CONFIRMAÇÃO DE CONSULTA - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nPrezado/a ${appointment.name},\n\nSua consulta médica foi confirmada com sucesso.\n\n� *DETALHES DA CONSULTA:*\n• Serviço: ${appointment.service}\n• Data: ${appointment.date}\n• Hora: ${appointment.time}\n${appointment.notes ? `• Notas: ${appointment.notes}\n` : ''}\n� *INSTRUÇÕES:*\n- Chegar 15 minutos antes\n- Trazer identificação oficial\n- Trazer exames anteriores (se aplicável)\n\n📞 *CONTATO:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n✉️ ${process.env.CLINIC_EMAIL || 'info@clinicamedicare.com'}\n\n*Obrigado por confiar em nossa instituição médica.*`,
    
    de: `🏥 *TERMINBESTÄTIGUNG - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nSehr geehrte/r ${appointment.name},\n\nIhr medizinischer Termin wurde erfolgreich bestätigt.\n\n� *TERMINDETAILS:*\n• Service: ${appointment.service}\n• Datum: ${appointment.date}\n• Zeit: ${appointment.time}\n${appointment.notes ? `• Notizen: ${appointment.notes}\n` : ''}\n� *ANWEISUNGEN:*\n- 15 Minuten früher erscheinen\n- Offiziellen Ausweis mitbringen\n- Vorherige Untersuchungen mitbringen (falls zutreffend)\n\n📞 *KONTAKT:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n✉️ ${process.env.CLINIC_EMAIL || 'info@clinicamedicare.com'}\n\n*Vielen Dank für Ihr Vertrauen in unsere medizinische Einrichtung.*`
  };
  
  return messages[lang] || messages.es;
}

/**
 * Genera mensaje de WhatsApp de recordatorio (versión profesional)
 */
function generateReminderMessage(appointment, reminderText, lang = 'es') {
  const messages = {
    es: `⏰ *RECORDATORIO DE CITA - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nEstimado/a ${appointment.name},\n\nLe recordamos que tiene programada una cita médica para mañana.\n\n📋 *DETALLES:*\n• Servicio: ${appointment.service}\n• Fecha: ${appointment.date}\n• Hora: ${appointment.time}\n\n📋 *RECOMENDACIONES:*\n- Confirmar asistencia\n- Llegar 15 minutos antes\n- Traer documentación requerida\n\n📞 *PARA CONFIRMAR O REAGENDAR:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n\n*Su salud es nuestra prioridad.*`,
    
    en: `⏰ *APPOINTMENT REMINDER - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nDear ${appointment.name},\n\nWe remind you that you have a medical appointment scheduled for tomorrow.\n\n📋 *DETAILS:*\n• Service: ${appointment.service}\n• Date: ${appointment.date}\n• Time: ${appointment.time}\n\n� *RECOMMENDATIONS:*\n- Confirm attendance\n- Arrive 15 minutes early\n- Bring required documentation\n\n�📞 *TO CONFIRM OR RESCHEDULE:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n\n*Your health is our priority.*`,
    
    fr: `⏰ *RAPPEL DE RENDEZ-VOUS - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nCher/Chère ${appointment.name},\n\nNous vous rappelons que vous avez un rendez-vous médical prévu pour demain.\n\n📋 *DÉTAILS:*\n• Service: ${appointment.service}\n• Date: ${appointment.date}\n• Heure: ${appointment.time}\n\n� *RECOMMANDATIONS:*\n- Confirmer votre présence\n- Arriver 15 minutes à l'avance\n- Apporter la documentation requise\n\n�📞 *POUR CONFIRMER OU REPROGRAMMER:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n\n*Votre santé est notre priorité.*`,
    
    pt: `⏰ *LEMBRETE DE CONSULTA - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nPrezado/a ${appointment.name},\n\nLembramos que você tem uma consulta médica agendada para amanhã.\n\n📋 *DETALHES:*\n• Serviço: ${appointment.service}\n• Data: ${appointment.date}\n• Hora: ${appointment.time}\n\n📋 *RECOMENDAÇÕES:*\n- Confirmar presença\n- Chegar 15 minutos antes\n- Trazer documentação necessária\n\n📞 *PARA CONFIRMAR OU REAGENDAR:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n\n*Sua saúde é nossa prioridade.*`,
    
    de: `⏰ *TERMINERINNERUNG - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nSehr geehrte/r ${appointment.name},\n\nWir erinnern Sie daran, dass Sie für morgen einen medizinischen Termin vereinbart haben.\n\n📋 *DETAILS:*\n• Service: ${appointment.service}\n• Datum: ${appointment.date}\n• Zeit: ${appointment.time}\n\n📋 *EMPFOHLUNGEN:*\n- Teilnahme bestätigen\n- 15 Minuten früher erscheinen\n- Erforderliche Unterlagen mitbringen\n\n📞 *ZUM BESTÄTIGEN ODER UMBUCHEN:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n\n*Ihre Gesundheit ist unsere Priorität.*`
  };
  
  return messages[lang] || messages.es;
}

/**
 * Genera mensaje de WhatsApp de cancelación (versión profesional)
 */
function generateCancellationMessage(appointment, lang = 'es') {
  const messages = {
    es: `❌ *CANCELACIÓN DE CITA - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nEstimado/a ${appointment.name},\n\nLamentamos informarle que su cita médica ha sido cancelada.\n\n📋 *DETALLES DE LA CITA CANCELADA:*\n• Servicio: ${appointment.service}\n• Fecha: ${appointment.date}\n• Hora: ${appointment.time}\n\n📋 *OPCIONES DISPONIBLES:*\n1. Reagendar para otra fecha/hora\n2. Solicitar consulta virtual\n3. Recibir asesoramiento médico\n\n📞 *PARA REAGENDAR O CONSULTAR:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n✉️ ${process.env.CLINIC_EMAIL || 'info@clinicamedicare.com'}\n\n*Disculpe las molestias ocasionadas.*`,
    
    en: `❌ *APPOINTMENT CANCELLATION - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nDear ${appointment.name},\n\nWe regret to inform you that your medical appointment has been cancelled.\n\n📋 *DETAILS OF CANCELLED APPOINTMENT:*\n• Service: ${appointment.service}\n• Date: ${appointment.date}\n• Time: ${appointment.time}\n\n📋 *AVAILABLE OPTIONS:*\n1. Reschedule for another date/time\n2. Request virtual consultation\n3. Receive medical advice\n\n📞 *TO RESCHEDULE OR CONSULT:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n✉️ ${process.env.CLINIC_EMAIL || 'info@clinicamedicare.com'}\n\n*We apologize for any inconvenience.*`,
    
    fr: `❌ *ANNULATION DE RENDEZ-VOUS - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nCher/Chère ${appointment.name},\n\nNous regrettons de vous informer que votre rendez-vous médical a été annulé.\n\n📋 *DÉTAILS DU RENDEZ-VOUS ANNULÉ:*\n• Service: ${appointment.service}\n• Date: ${appointment.date}\n• Heure: ${appointment.time}\n\n📋 *OPTIONS DISPONIBLES:*\n1. Reprogrammer pour une autre date/heure\n2. Demander une consultation virtuelle\n3. Recevoir des conseils médicaux\n\n📞 *POUR REPROGRAMMER OU CONSULTER:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n✉️ ${process.env.CLINIC_EMAIL || 'info@clinicamedicare.com'}\n\n*Nous nous excusons pour tout inconvénient.*`,
    
    pt: `❌ *CANCELAMENTO DE CONSULTA - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nPrezado/a ${appointment.name},\n\nLamentamos informar que sua consulta médica foi cancelada.\n\n📋 *DETALHES DA CONSULTA CANCELADA:*\n• Serviço: ${appointment.service}\n• Data: ${appointment.date}\n• Hora: ${appointment.time}\n\n📋 *OPÇÕES DISPONÍVEIS:*\n1. Reagendar para outra data/hora\n2. Solicitar consulta virtual\n3. Receber orientação médica\n\n📞 *PARA REAGENDAR OU CONSULTAR:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n✉️ ${process.env.CLINIC_EMAIL || 'info@clinicamedicare.com'}\n\n*Pedimos desculpas por qualquer inconveniente.*`,
    
    de: `❌ *TERMINSTORNIERUNG - ${process.env.CLINIC_NAME || 'MediCare AI'}*\n\nSehr geehrte/r ${appointment.name},\n\nWir bedauern, Ihnen mitteilen zu müssen, dass Ihr medizinischer Termin storniert wurde.\n\n📋 *DETAILS DES STORNIERTEN TERMINS:*\n• Service: ${appointment.service}\n• Datum: ${appointment.date}\n• Zeit: ${appointment.time}\n\n📋 *VERFÜGBARE OPTIONEN:*\n1. Für ein anderes Datum/Uhrzeit umbuchen\n2. Virtuelle Konsultation anfordern\n3. Medizinische Beratung erhalten\n\n📞 *ZUM UMBUCHEN ODER BERATEN:*\n${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n✉️ ${process.env.CLINIC_EMAIL || 'info@clinicamedicare.com'}\n\n*Wir entschuldigen uns für eventuelle Unannehmlichkeiten.*`
  };
  
  return messages[lang] || messages.es;
}

/**
 * Envía mensaje de WhatsApp de confirmación
 */
async function sendWhatsAppConfirmation(appointment, aiMessage) {
  try {
    // Validar número de teléfono
    if (!isValidPhoneNumber(appointment.phone)) {
      console.warn(`[${new Date().toISOString()}] ⚠️ WhatsApp skipped for ${appointment.name}: invalid phone number (${appointment.phone})`);
      return { success: false, skipped: true, reason: 'Invalid phone number' };
    }
    
    const client = createTwilioClient();
    const toNumber = normalizePhoneNumber(appointment.phone);
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const message = generateConfirmationMessage(appointment, aiMessage, appointment.lang || 'es');
    
    const result = await client.messages.create({
      from: fromNumber,
      to: `whatsapp:${toNumber}`,
      body: message
    });
    
    console.log(`[${new Date().toISOString()}] ✅ WhatsApp confirmation sent to ${toNumber} (${appointment.name}) - SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ WhatsApp confirmation failed for ${appointment.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Envía mensaje de WhatsApp de recordatorio
 */
async function sendWhatsAppReminder(appointment, reminderText) {
  try {
    // Validar número de teléfono
    if (!isValidPhoneNumber(appointment.phone)) {
      console.warn(`[${new Date().toISOString()}] ⚠️ WhatsApp reminder skipped for ${appointment.name}: invalid phone number (${appointment.phone})`);
      return { success: false, skipped: true, reason: 'Invalid phone number' };
    }
    
    const client = createTwilioClient();
    const toNumber = normalizePhoneNumber(appointment.phone);
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const message = generateReminderMessage(appointment, reminderText, appointment.lang || 'es');
    
    const result = await client.messages.create({
      from: fromNumber,
      to: `whatsapp:${toNumber}`,
      body: message
    });
    
    console.log(`[${new Date().toISOString()}] ✅ WhatsApp reminder sent to ${toNumber} (${appointment.name}) - SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ WhatsApp reminder failed for ${appointment.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Envía mensaje de WhatsApp de cancelación
 */
async function sendWhatsAppCancellation(appointment) {
  try {
    // Validar número de teléfono
    if (!isValidPhoneNumber(appointment.phone)) {
      console.warn(`[${new Date().toISOString()}] ⚠️ WhatsApp cancellation skipped for ${appointment.name}: invalid phone number (${appointment.phone})`);
      return { success: false, skipped: true, reason: 'Invalid phone number' };
    }
    
    const client = createTwilioClient();
    const toNumber = normalizePhoneNumber(appointment.phone);
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const message = generateCancellationMessage(appointment, appointment.lang || 'es');
    
    const result = await client.messages.create({
      from: fromNumber,
      to: `whatsapp:${toNumber}`,
      body: message
    });
    
    console.log(`[${new Date().toISOString()}] ✅ WhatsApp cancellation sent to ${toNumber} (${appointment.name}) - SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ WhatsApp cancellation failed for ${appointment.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendWhatsAppConfirmation,
  sendWhatsAppReminder,
  sendWhatsAppCancellation,
  normalizePhoneNumber,
  isValidPhoneNumber
};

