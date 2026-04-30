const nodemailer = require('nodemailer');

// Mapeo de idiomas para asuntos de email
const LANG_NAMES = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  pt: 'Português',
  de: 'Deutsch'
};

const EMAIL_SUBJECTS = {
  confirmation: {
    es: '✅ Confirmación de Cita - Clínica MediCare',
    en: '✅ Appointment Confirmation - Clínica MediCare',
    fr: '✅ Confirmation de Rendez-vous - Clínica MediCare',
    pt: '✅ Confirmação de Consulta - Clínica MediCare',
    de: '✅ Terminbestätigung - Clínica MediCare'
  },
  reminder: {
    es: '⏰ Recordatorio: Cita de {service} mañana - Clínica MediCare',
    en: '⏰ Reminder: {service} appointment tomorrow - Clínica MediCare',
    fr: '⏰ Rappel: Rendez-vous {service} demain - Clínica MediCare',
    pt: '⏰ Lembrete: Consulta de {service} amanhã - Clínica MediCare',
    de: '⏰ Erinnerung: {service}-Termin morgen - Clínica MediCare'
  },
  cancellation: {
    es: '❌ Cancelación de Cita - Clínica MediCare',
    en: '❌ Appointment Cancellation - Clínica MediCare',
    fr: '❌ Annulation de Rendez-vous - Clínica MediCare',
    pt: '❌ Cancelamento de Consulta - Clínica MediCare',
    de: '❌ Terminstornierung - Clínica MediCare'
  }
};

/**
 * Crea el transporter de Nodemailer
 * Modo demo si no hay credenciales SMTP
 */
function createTransporter() {
  // Modo demo si no hay credenciales SMTP
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'tu-email@gmail.com') {
    console.log('⚠️  Modo demo - Sin credenciales SMTP');
    
    // Transporter simulado para demo
    return {
      sendMail: async (mailOptions) => {
        console.log(`📧 [DEMO] Email enviado a: ${mailOptions.to}`);
        console.log(`📧 [DEMO] Asunto: ${mailOptions.subject}`);
        console.log('📧 [DEMO] Email simulado exitosamente');
        
        return {
          messageId: `demo-${Date.now()}`,
          response: '250 2.0.0 OK - Email simulado'
        };
      }
    };
  }
  
  // Transporter real con Nodemailer
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Genera el HTML del email con diseño médico profesional
 */
function generateEmailHTML(appointment, message, type = 'confirmation') {
  const accentColor = '#3b82f6';
  const bgColor = '#0a0f1e';
  const cardBg = '#111827';
  const textColor = '#f9fafb';
  const clinicName = 'Clínica MediCare';
  
  let icon = '✦';
  let headerText = 'Confirmación de Cita';
  if (type === 'reminder') {
    icon = '⏰';
    headerText = 'Recordatorio de Cita';
  }
  if (type === 'cancellation') {
    icon = '❌';
    headerText = 'Cancelación de Cita';
  }
  
  return `
<!DOCTYPE html>
<html lang="${appointment.lang || 'es'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${clinicName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: ${cardBg}; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          
          <!-- Header con gradiente -->
          <tr>
            <td style="background: linear-gradient(135deg, ${accentColor} 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
              <h1 style="margin: 0; color: ${textColor}; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                ${clinicName}
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 500;">
                ${headerText}
              </p>
            </td>
          </tr>
          
          <!-- Contenido principal -->
          <tr>
            <td style="padding: 40px 30px; color: ${textColor};">
              <div style="font-size: 16px; line-height: 1.8; color: #d1d5db; margin-bottom: 30px;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              
              ${type !== 'cancellation' ? `
              <!-- Tarjeta de detalles -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%); border-radius: 12px; border: 2px solid rgba(59, 130, 246, 0.3); margin: 25px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 25px;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #60a5fa; font-weight: 600; font-size: 15px; padding: 8px 0;">
                          <span style="font-size: 20px; margin-right: 8px;">👤</span> Paciente
                        </td>
                        <td style="color: ${textColor}; font-size: 15px; text-align: right; padding: 8px 0;">
                          ${appointment.name}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-top: 1px solid rgba(59, 130, 246, 0.2);"></td>
                      </tr>
                      <tr>
                        <td style="color: #60a5fa; font-weight: 600; font-size: 15px; padding: 8px 0;">
                          <span style="font-size: 20px; margin-right: 8px;">🏥</span> Servicio
                        </td>
                        <td style="color: ${textColor}; font-size: 15px; text-align: right; padding: 8px 0;">
                          ${appointment.service}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-top: 1px solid rgba(59, 130, 246, 0.2);"></td>
                      </tr>
                      <tr>
                        <td style="color: #60a5fa; font-weight: 600; font-size: 15px; padding: 8px 0;">
                          <span style="font-size: 20px; margin-right: 8px;">📅</span> Fecha
                        </td>
                        <td style="color: ${textColor}; font-size: 15px; text-align: right; padding: 8px 0;">
                          ${appointment.date}
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-top: 1px solid rgba(59, 130, 246, 0.2);"></td>
                      </tr>
                      <tr>
                        <td style="color: #60a5fa; font-weight: 600; font-size: 15px; padding: 8px 0;">
                          <span style="font-size: 20px; margin-right: 8px;">⏰</span> Hora
                        </td>
                        <td style="color: ${textColor}; font-size: 15px; text-align: right; padding: 8px 0;">
                          ${appointment.time}
                        </td>
                      </tr>
                      ${appointment.notes ? `
                      <tr>
                        <td colspan="2" style="border-top: 1px solid rgba(59, 130, 246, 0.2);"></td>
                      </tr>
                      <tr>
                        <td style="color: #60a5fa; font-weight: 600; font-size: 15px; padding: 8px 0;">
                          <span style="font-size: 20px; margin-right: 8px;">📝</span> Notas
                        </td>
                        <td style="color: ${textColor}; font-size: 15px; text-align: right; padding: 8px 0;">
                          ${appointment.notes}
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              ${type === 'confirmation' ? `
              <!-- Instrucciones importantes -->
              <div style="background-color: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin: 0 0 12px 0; color: #34d399; font-size: 16px; font-weight: 600;">
                  📋 Instrucciones Importantes
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #d1d5db; font-size: 14px; line-height: 1.8;">
                  <li>Llegar 15 minutos antes de la cita</li>
                  <li>Traer identificación oficial</li>
                  <li>Traer estudios médicos previos (si aplica)</li>
                  <li>Evitar comer 2 horas antes si es necesario</li>
                </ul>
              </div>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: rgba(17, 24, 39, 0.8); padding: 30px; border-top: 1px solid rgba(59, 130, 246, 0.2);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center;">
                    <h3 style="margin: 0 0 15px 0; color: #60a5fa; font-size: 16px; font-weight: 600;">
                      Información de Contacto
                    </h3>
                    <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.8;">
                      📞 ${process.env.CLINIC_PHONE || '+1 829 555 0000'}<br>
                      ✉️ ${process.env.CLINIC_EMAIL || 'info@clinicamedicare.com'}<br>
                      📍 ${process.env.CLINIC_ADDRESS || 'Av. Principal 123, Santo Domingo, RD'}
                    </p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(156, 163, 175, 0.2);">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        © ${new Date().getFullYear()} ${clinicName}. Todos los derechos reservados.
                      </p>
                      <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 11px;">
                        Sistema de Citas Médicas Profesional
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Genera la versión texto plano del email
 */
function generateEmailText(appointment, message, type = 'confirmation') {
  const clinicName = 'Clínica MediCare';
  let text = `${clinicName}\n${'='.repeat(clinicName.length)}\n\n${message}\n\n`;
  
  if (type !== 'cancellation') {
    text += `DETALLES DE LA CITA:\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `👤 Paciente: ${appointment.name}\n`;
    text += `🏥 Servicio: ${appointment.service}\n`;
    text += `📅 Fecha: ${appointment.date}\n`;
    text += `⏰ Hora: ${appointment.time}\n`;
    if (appointment.notes) {
      text += `📝 Notas: ${appointment.notes}\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  }
  
  if (type === 'confirmation') {
    text += `INSTRUCCIONES IMPORTANTES:\n`;
    text += `• Llegar 15 minutos antes de la cita\n`;
    text += `• Traer identificación oficial\n`;
    text += `• Traer estudios médicos previos (si aplica)\n`;
    text += `• Evitar comer 2 horas antes si es necesario\n\n`;
  }
  
  text += `INFORMACIÓN DE CONTACTO:\n`;
  text += `📞 Teléfono: ${process.env.CLINIC_PHONE || '+1 829 555 0000'}\n`;
  text += `✉️ Email: ${process.env.CLINIC_EMAIL || 'info@clinicamedicare.com'}\n`;
  text += `📍 Dirección: ${process.env.CLINIC_ADDRESS || 'Av. Principal 123, Santo Domingo, RD'}\n\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `© ${new Date().getFullYear()} ${clinicName}\n`;
  text += `Sistema de Citas Médicas Profesional`;
  
  return text;
}

/**
 * Envía email de confirmación de cita
 */
async function sendAppointmentConfirmation(appointment, aiMessage) {
  try {
    const transporter = createTransporter();
    const lang = appointment.lang || 'es';
    const subject = EMAIL_SUBJECTS.confirmation[lang];
    
    const mailOptions = {
      from: `"Clínica MediCare" <${process.env.SMTP_USER}>`,
      to: appointment.email,
      subject: subject,
      text: generateEmailText(appointment, aiMessage, 'confirmation'),
      html: generateEmailHTML(appointment, aiMessage, 'confirmation')
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`[${new Date().toISOString()}] ✅ Email confirmation sent to ${appointment.email} (${appointment.name})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Email confirmation failed for ${appointment.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Envía email de recordatorio de cita
 */
async function sendAppointmentReminder(appointment, reminderText) {
  try {
    const transporter = createTransporter();
    const lang = appointment.lang || 'es';
    let subject = EMAIL_SUBJECTS.reminder[lang];
    subject = subject.replace('{service}', appointment.service);
    
    const mailOptions = {
      from: `"Clínica MediCare" <${process.env.SMTP_USER}>`,
      to: appointment.email,
      subject: subject,
      text: generateEmailText(appointment, reminderText, 'reminder'),
      html: generateEmailHTML(appointment, reminderText, 'reminder')
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`[${new Date().toISOString()}] ✅ Email reminder sent to ${appointment.email} (${appointment.name})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Email reminder failed for ${appointment.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Envía email de cancelación de cita
 */
async function sendAppointmentCancellation(appointment) {
  try {
    const transporter = createTransporter();
    const lang = appointment.lang || 'es';
    const subject = EMAIL_SUBJECTS.cancellation[lang];
    
    const messages = {
      es: `Estimado/a ${appointment.name},\n\nTu cita de ${appointment.service} programada para el ${appointment.date} a las ${appointment.time} ha sido cancelada.\n\nSi deseas reagendar, por favor contáctanos.`,
      en: `Dear ${appointment.name},\n\nYour ${appointment.service} appointment scheduled for ${appointment.date} at ${appointment.time} has been cancelled.\n\nIf you wish to reschedule, please contact us.`,
      fr: `Cher/Chère ${appointment.name},\n\nVotre rendez-vous ${appointment.service} prévu le ${appointment.date} à ${appointment.time} a été annulé.\n\nSi vous souhaitez reprogrammer, veuillez nous contacter.`,
      pt: `Prezado/a ${appointment.name},\n\nSua consulta de ${appointment.service} agendada para ${appointment.date} às ${appointment.time} foi cancelada.\n\nSe desejar reagendar, entre em contato conosco.`,
      de: `Sehr geehrte/r ${appointment.name},\n\nIhr ${appointment.service}-Termin am ${appointment.date} um ${appointment.time} wurde storniert.\n\nWenn Sie einen neuen Termin vereinbaren möchten, kontaktieren Sie uns bitte.`
    };
    
    const message = messages[lang] || messages.es;
    
    const mailOptions = {
      from: `"Clínica MediCare" <${process.env.SMTP_USER}>`,
      to: appointment.email,
      subject: subject,
      text: generateEmailText(appointment, message, 'cancellation'),
      html: generateEmailHTML(appointment, message, 'cancellation')
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`[${new Date().toISOString()}] ✅ Email cancellation sent to ${appointment.email} (${appointment.name})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Email cancellation failed for ${appointment.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentCancellation
};
