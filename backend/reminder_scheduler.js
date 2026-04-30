require('dotenv').config();
const { OpenAI } = require('openai');
const database = require('./database-postgres');
const notificationService = require('./notifications/notificationService');

// Cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Llama a OpenAI (GPT-3.5 Turbo) para generar texto
 */
async function callOpenAI(systemPrompt, userMessage, maxTokens = 300) {
  try {
    // Modo demo si no hay credenciales OpenAI
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('xxxxxxxx')) {
      console.log('⚠️  Modo demo - Sin credenciales OpenAI');
      
      // Respuesta simulada para demo
      const demoResponse = `Hola, te recordamos tu cita médica de mañana. Por favor:
- Llega 15 minutos antes
- Trae tu identificación
- Evita comer 2 horas antes si es necesario

¡Nos vemos pronto en MediCare AI! 🏥`;
      
      // Simular delay de IA
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return demoResponse;
    }
    
    // Código real con OpenAI
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
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    throw error;
  }
}

/**
 * Procesa recordatorios pendientes (citas para mañana)
 */
async function processReminders() {
  console.log(`\n[${new Date().toISOString()}] 🔄 Checking for appointments needing reminders...`);
  
  try {
    // Obtener citas que necesitan recordatorio (24h antes)
    const appointments = database.getAppointmentsForReminders();
    
    if (appointments.length === 0) {
      console.log(`[${new Date().toISOString()}] ℹ️ No appointments found for tomorrow`);
      return;
    }
    
    console.log(`[${new Date().toISOString()}] 📋 Found ${appointments.length} appointment(s) for tomorrow`);
    
    for (const appt of appointments) {
      try {
        console.log(`[${new Date().toISOString()}] 🔄 Processing reminder for ${appt.name} (${appt.service})`);
        
        // Generar texto del recordatorio con IA
        const systemPrompt = `Eres un asistente médico profesional de ${process.env.CLINIC_NAME || 'MediCare AI'}.
Genera un recordatorio breve y amigable (máximo 3 líneas) para una cita médica que es mañana.
Responde en ${appt.lang || 'español'}.`;

        const userMessage = `Genera un recordatorio para mañana:
Paciente: ${appt.name}
Servicio: ${appt.service}
Fecha: ${appt.date}
Hora: ${appt.time}`;

        const reminderText = await callOpenAI(systemPrompt, userMessage, 200);
        
        // Crear recordatorio en la base de datos
        const reminder = database.createReminder({
          appointment_id: appt.id,
          name: appt.name,
          service: appt.service,
          date: appt.date,
          lang: appt.lang || 'es',
          message: reminderText,
          auto: true
        });
        
        // Enviar notificaciones (Email + WhatsApp)
        const result = await notificationService.notifyAppointmentReminder(appt, reminderText);
        
        // Marcar como enviado si al menos uno fue exitoso
        if (result.anySuccess) {
          database.markReminderAsSent(reminder.id);
          console.log(`[${new Date().toISOString()}] ✅ Reminder processed successfully for ${appt.name}`);
        } else {
          console.error(`[${new Date().toISOString()}] ❌ All notification channels failed for ${appt.name}`);
        }
        
      } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error processing reminder for ${appt.name}:`, error.message);
      }
    }
    
    console.log(`[${new Date().toISOString()}] ✅ Reminder processing completed\n`);
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error in processReminders:`, error);
  }
}

/**
 * Inicia el scheduler (corre cada hora)
 */
function startScheduler() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ⏰ MediCare AI - Reminder Scheduler                     ║
║                                                           ║
║   Checking for reminders every hour...                   ║
║   Sends notifications 24h before appointments            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
  
  // Ejecutar inmediatamente al iniciar
  processReminders();
  
  // Ejecutar cada hora (3600000 ms)
  setInterval(processReminders, 3600000);
}

// Si se ejecuta directamente (no como módulo)
if (require.main === module) {
  startScheduler();
}

module.exports = {
  processReminders,
  startScheduler
};
