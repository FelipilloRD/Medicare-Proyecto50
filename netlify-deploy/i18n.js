// Sistema de internacionalización (i18n) para Clínica MediCare
// Soporta: ES, EN, FR, PT, DE

const translations = {
  es: {
    // Login
    login_title: 'Iniciar Sesión',
    login_subtitle: 'Accede a tu cuenta para continuar',
    login_username: 'Usuario o Email',
    login_username_placeholder: 'admin',
    login_password: 'Contraseña',
    login_button: 'Iniciar Sesión',
    login_loading: 'Iniciando sesión...',
    login_error_empty: 'Por favor completa todos los campos',
    login_error_generic: 'Error al iniciar sesión',
    login_footer: 'Sistema de Citas Médicas Profesional',
    logout_button: 'Cerrar Sesión',
    
    // Navegación
    nav_home: 'Inicio',
    nav_appointments: 'Agendar Cita',
    nav_services: 'Servicios',
    nav_reminders: 'Recordatorios',
    nav_chat: 'Chat Asistente',
    
    // Hero Section
    hero_badge: 'Atención Médica de Excelencia',
    hero_title_1: 'Tu Salud en las',
    hero_title_2: 'Mejores Manos',
    hero_subtitle: 'Atención médica profesional las 24 horas. Agenda tu cita en segundos y recibe confirmación inmediata con nuestro equipo de especialistas certificados.',
    hero_cta: 'Agendar Cita Ahora',
    
    // Trust Indicators
    trust_patients: 'Pacientes',
    trust_attention: 'Atención',
    trust_certified: 'Certificados',
    
    // Features
    feature_personalized_title: 'Atención Personalizada',
    feature_personalized_desc: 'Confirmaciones y respuestas inmediatas las 24 horas',
    feature_email_title: 'Notificaciones Email',
    feature_email_desc: 'Confirmaciones y recordatorios por correo electrónico',
    feature_whatsapp_title: 'WhatsApp',
    feature_whatsapp_desc: 'Mensajes instantáneos vía WhatsApp',
    feature_multilang_title: 'Multiidioma',
    feature_multilang_desc: 'Soporte en 5 idiomas: ES, EN, FR, PT, DE',
    
    // Stats
    stat_consultations: 'Consultas Realizadas',
    stat_specialists: 'Especialistas',
    stat_experience: 'Años de Experiencia',
    stat_satisfaction: '% Satisfacción',
    
    // Specialties
    specialty_cardiology: 'Cardiología',
    specialty_neurology: 'Neurología',
    specialty_dentistry: 'Odontología',
    
    // Inicio
    home_title: 'Bienvenido a Clínica MediCare',
    home_subtitle: 'Tu salud, nuestra prioridad. Atención médica profesional cuando la necesitas.',
    home_cta: 'Agendar Cita Ahora',
    
    // Formulario de citas
    form_title: 'Agendar Nueva Cita',
    form_name: 'Nombre completo',
    form_email: 'Correo electrónico',
    form_phone: 'Teléfono (WhatsApp)',
    form_date: 'Fecha',
    form_time: 'Hora',
    form_service: 'Servicio',
    form_service_select: 'Selecciona un servicio',
    form_notes: 'Notas adicionales',
    form_notes_placeholder: 'Describe tus síntomas o motivo de consulta...',
    form_submit: '📅 Agendar Cita',
    form_loading: 'Procesando...',
    
    // Servicios
    services_title: 'Nuestros Servicios Médicos',
    services_badge: 'Especialidades Médicas',
    services_subtitle: 'Contamos con un equipo multidisciplinario de especialistas certificados para brindarte la mejor atención médica en cada área.',
    
    // Categorías de servicios
    service_category_general: 'General',
    service_category_specialty: 'Especialidad',
    service_category_diagnostic: 'Diagnóstico',
    service_btn_details: 'Ver detalles',
    
    // Consulta General
    service_general_title: 'Consulta General',
    service_general_desc: 'Atención médica integral para todas las edades',
    service_general_feature1: 'Diagnóstico completo',
    service_general_feature2: 'Recetas médicas',
    
    // Cardiología
    service_cardiology_title: 'Cardiología',
    service_cardiology_desc: 'Cuidado especializado del corazón',
    service_cardiology_feature1: 'Electrocardiograma',
    service_cardiology_feature2: 'Ecocardiografía',
    
    // Pediatría
    service_pediatrics_title: 'Pediatría',
    service_pediatrics_desc: 'Atención médica para niños y adolescentes',
    service_pediatrics_feature1: 'Control de crecimiento',
    service_pediatrics_feature2: 'Vacunación',
    
    // Dermatología
    service_dermatology_title: 'Dermatología',
    service_dermatology_desc: 'Cuidado de la piel y tratamientos especializados',
    service_dermatology_feature1: 'Tratamientos faciales',
    service_dermatology_feature2: 'Dermatología estética',
    
    // Laboratorio
    service_laboratory_title: 'Laboratorio',
    service_laboratory_desc: 'Análisis clínicos y pruebas diagnósticas',
    service_laboratory_feature1: 'Análisis de sangre',
    service_laboratory_feature2: 'Resultados rápidos',
    
    // Rayos X
    service_xray_title: 'Rayos X',
    service_xray_desc: 'Imagenología y diagnóstico por imagen',
    service_xray_feature1: 'Radiografías digitales',
    service_xray_feature2: 'Resultados inmediatos',
    
    // Odontología
    service_dentistry_title: 'Odontología',
    service_dentistry_desc: 'Salud dental y tratamientos odontológicos',
    service_dentistry_feature1: 'Limpieza dental',
    service_dentistry_feature2: 'Ortodoncia',
    
    // Psicología
    service_psychology_title: 'Psicología',
    service_psychology_desc: 'Apoyo emocional y salud mental',
    service_psychology_feature1: 'Terapia individual',
    service_psychology_feature2: 'Terapia familiar',
    service_general: 'Consulta General',
    service_cardiology: 'Cardiología',
    service_pediatrics: 'Pediatría',
    service_dermatology: 'Dermatología',
    service_laboratory: 'Laboratorio',
    service_xray: 'Rayos X',
    service_dentistry: 'Odontología',
    service_psychology: 'Psicología',
    
    // Recordatorios
    reminders_title: 'Generar Recordatorio',
    reminders_subtitle: 'Crea recordatorios personalizados para tus citas',
    
    // Chat
    chat_title: 'Asistente Virtual 24/7',
    chat_placeholder: 'Escribe tu pregunta...',
    chat_send: 'Enviar',
    chat_welcome: '👋 ¡Hola! Soy tu asistente virtual de Clínica MediCare. ¿En qué puedo ayudarte hoy?',
    
    // Notificaciones
    notif_email_sent: 'Email enviado',
    notif_whatsapp_sent: 'WhatsApp enviado',
    
    // Mensajes
    success: 'Éxito',
    error: 'Error',
    loading: 'Cargando...'
  },
  
  en: {
    // Login
    login_title: 'Sign In',
    login_subtitle: 'Access your account to continue',
    login_username: 'Username or Email',
    login_username_placeholder: 'admin',
    login_password: 'Password',
    login_button: 'Sign In',
    login_loading: 'Signing in...',
    login_error_empty: 'Please fill in all fields',
    login_error_generic: 'Login error',
    login_footer: 'Professional Medical Appointment System',
    logout_button: 'Sign Out',
    
    nav_home: 'Home',
    nav_appointments: 'Book Appointment',
    nav_services: 'Services',
    nav_reminders: 'Reminders',
    nav_chat: 'AI Chat',
    
    // Hero Section
    hero_badge: 'Excellence in Medical Care',
    hero_title_1: 'Your Health in the',
    hero_title_2: 'Best Hands',
    hero_subtitle: 'Professional medical care 24/7. Book your appointment in seconds and receive immediate confirmation from our team of certified specialists.',
    hero_cta: 'Book Appointment Now',
    
    // Trust Indicators
    trust_patients: 'Patients',
    trust_attention: 'Care',
    trust_certified: 'Certified',
    
    // Features
    feature_personalized_title: 'Personalized Care',
    feature_personalized_desc: 'Immediate confirmations and responses 24/7',
    feature_email_title: 'Email Notifications',
    feature_email_desc: 'Confirmations and reminders via email',
    feature_whatsapp_title: 'WhatsApp',
    feature_whatsapp_desc: 'Instant messages via WhatsApp',
    feature_multilang_title: 'Multilingual',
    feature_multilang_desc: 'Support in 5 languages: ES, EN, FR, PT, DE',
    
    // Stats
    stat_consultations: 'Consultations Completed',
    stat_specialists: 'Specialists',
    stat_experience: 'Years of Experience',
    stat_satisfaction: '% Satisfaction',
    
    // Specialties
    specialty_cardiology: 'Cardiology',
    specialty_neurology: 'Neurology',
    specialty_dentistry: 'Dentistry',
    
    home_title: 'Welcome to MediCare Clinic',
    home_subtitle: 'Your health, our priority. Professional medical care when you need it.',
    home_cta: 'Book Appointment Now',
    
    form_title: 'Book New Appointment',
    form_name: 'Full name',
    form_email: 'Email address',
    form_phone: 'Phone (WhatsApp)',
    form_date: 'Date',
    form_time: 'Time',
    form_service: 'Service',
    form_service_select: 'Select a service',
    form_notes: 'Additional notes',
    form_notes_placeholder: 'Describe your symptoms or reason for consultation...',
    form_submit: '📅 Book Appointment',
    form_loading: 'Processing...',
    
    services_title: 'Our Medical Services',
    services_badge: 'Medical Specialties',
    services_subtitle: 'We have a multidisciplinary team of certified specialists to provide you with the best medical care in each area.',
    
    // Service categories
    service_category_general: 'General',
    service_category_specialty: 'Specialty',
    service_category_diagnostic: 'Diagnostic',
    service_btn_details: 'View details',
    
    // General Consultation
    service_general_title: 'General Consultation',
    service_general_desc: 'Comprehensive medical care for all ages',
    service_general_feature1: 'Complete diagnosis',
    service_general_feature2: 'Medical prescriptions',
    
    // Cardiology
    service_cardiology_title: 'Cardiology',
    service_cardiology_desc: 'Specialized heart care',
    service_cardiology_feature1: 'Electrocardiogram',
    service_cardiology_feature2: 'Echocardiography',
    
    // Pediatrics
    service_pediatrics_title: 'Pediatrics',
    service_pediatrics_desc: 'Medical care for children and adolescents',
    service_pediatrics_feature1: 'Growth monitoring',
    service_pediatrics_feature2: 'Vaccination',
    
    // Dermatology
    service_dermatology_title: 'Dermatology',
    service_dermatology_desc: 'Skin care and specialized treatments',
    service_dermatology_feature1: 'Facial treatments',
    service_dermatology_feature2: 'Aesthetic dermatology',
    
    // Laboratory
    service_laboratory_title: 'Laboratory',
    service_laboratory_desc: 'Clinical analysis and diagnostic tests',
    service_laboratory_feature1: 'Blood analysis',
    service_laboratory_feature2: 'Fast results',
    
    // X-Ray
    service_xray_title: 'X-Ray',
    service_xray_desc: 'Imaging and diagnostic imaging',
    service_xray_feature1: 'Digital radiographs',
    service_xray_feature2: 'Immediate results',
    
    // Dentistry
    service_dentistry_title: 'Dentistry',
    service_dentistry_desc: 'Dental health and dental treatments',
    service_dentistry_feature1: 'Dental cleaning',
    service_dentistry_feature2: 'Orthodontics',
    
    // Psychology
    service_psychology_title: 'Psychology',
    service_psychology_desc: 'Emotional support and mental health',
    service_psychology_feature1: 'Individual therapy',
    service_psychology_feature2: 'Family therapy',
    service_general: 'General Consultation',
    service_cardiology: 'Cardiology',
    service_pediatrics: 'Pediatrics',
    service_dermatology: 'Dermatology',
    service_laboratory: 'Laboratory',
    service_xray: 'X-Ray',
    service_dentistry: 'Dentistry',
    service_psychology: 'Psychology',
    
    reminders_title: 'Generate Reminder',
    reminders_subtitle: 'Create personalized reminders for your appointments',
    
    chat_title: '24/7 Virtual Assistant',
    chat_placeholder: 'Type your question...',
    chat_send: 'Send',
    chat_welcome: '👋 Hello! I\'m your virtual assistant from MediCare Clinic. How can I help you today?',
    
    notif_email_sent: 'Email sent',
    notif_whatsapp_sent: 'WhatsApp sent',
    
    success: 'Success',
    error: 'Error',
    loading: 'Loading...'
  },
  
  fr: {
    // Login
    login_title: 'Se Connecter',
    login_subtitle: 'Accédez à votre compte pour continuer',
    login_username: 'Nom d\'utilisateur ou Email',
    login_username_placeholder: 'admin',
    login_password: 'Mot de passe',
    login_button: 'Se Connecter',
    login_loading: 'Connexion...',
    login_error_empty: 'Veuillez remplir tous les champs',
    login_error_generic: 'Erreur de connexion',
    login_footer: 'Système de Rendez-vous Médicaux Professionnel',
    logout_button: 'Se Déconnecter',
    
    nav_home: 'Accueil',
    nav_appointments: 'Prendre RDV',
    nav_services: 'Services',
    nav_reminders: 'Rappels',
    nav_chat: 'Chat IA',
    
    // Hero Section
    hero_badge: 'Excellence en Soins Médicaux',
    hero_title_1: 'Votre Santé entre les',
    hero_title_2: 'Meilleures Mains',
    hero_subtitle: 'Soins médicaux professionnels 24h/24. Prenez rendez-vous en quelques secondes et recevez une confirmation immédiate de notre équipe de spécialistes certifiés.',
    hero_cta: 'Prendre RDV Maintenant',
    
    // Trust Indicators
    trust_patients: 'Patients',
    trust_attention: 'Soins',
    trust_certified: 'Certifiés',
    
    // Features
    feature_personalized_title: 'Soins Personnalisés',
    feature_personalized_desc: 'Confirmations et réponses immédiates 24h/24',
    feature_email_title: 'Notifications Email',
    feature_email_desc: 'Confirmations et rappels par e-mail',
    feature_whatsapp_title: 'WhatsApp',
    feature_whatsapp_desc: 'Messages instantanés via WhatsApp',
    feature_multilang_title: 'Multilingue',
    feature_multilang_desc: 'Support en 5 langues: ES, EN, FR, PT, DE',
    
    // Stats
    stat_consultations: 'Consultations Réalisées',
    stat_specialists: 'Spécialistes',
    stat_experience: 'Années d\'Expérience',
    stat_satisfaction: '% Satisfaction',
    
    // Specialties
    specialty_cardiology: 'Cardiologie',
    specialty_neurology: 'Neurologie',
    specialty_dentistry: 'Dentisterie',
    
    home_title: 'Bienvenue à la Clinique MediCare',
    home_subtitle: 'Votre santé, notre priorité. Soins médicaux professionnels quand vous en avez besoin.',
    home_cta: 'Prendre RDV Maintenant',
    
    form_title: 'Nouveau Rendez-vous',
    form_name: 'Nom complet',
    form_email: 'Adresse e-mail',
    form_phone: 'Téléphone (WhatsApp)',
    form_date: 'Date',
    form_time: 'Heure',
    form_service: 'Service',
    form_notes: 'Notes supplémentaires',
    form_submit: 'Réserver RDV',
    form_loading: 'Traitement...',
    
    services_title: 'Nos Services Médicaux',
    services_badge: 'Spécialités Médicales',
    services_subtitle: 'Nous avons une équipe multidisciplinaire de spécialistes certifiés pour vous offrir les meilleurs soins médicaux dans chaque domaine.',
    
    // Catégories de services
    service_category_general: 'Général',
    service_category_specialty: 'Spécialité',
    service_category_diagnostic: 'Diagnostic',
    service_btn_details: 'Voir détails',
    
    // Consultation Générale
    service_general_title: 'Consultation Générale',
    service_general_desc: 'Soins médicaux complets pour tous les âges',
    service_general_feature1: 'Diagnostic complet',
    service_general_feature2: 'Prescriptions médicales',
    
    // Cardiologie
    service_cardiology_title: 'Cardiologie',
    service_cardiology_desc: 'Soins spécialisés du cœur',
    service_cardiology_feature1: 'Électrocardiogramme',
    service_cardiology_feature2: 'Échocardiographie',
    
    // Pédiatrie
    service_pediatrics_title: 'Pédiatrie',
    service_pediatrics_desc: 'Soins médicaux pour enfants et adolescents',
    service_pediatrics_feature1: 'Suivi de croissance',
    service_pediatrics_feature2: 'Vaccination',
    
    // Dermatologie
    service_dermatology_title: 'Dermatologie',
    service_dermatology_desc: 'Soins de la peau et traitements spécialisés',
    service_dermatology_feature1: 'Traitements faciaux',
    service_dermatology_feature2: 'Dermatologie esthétique',
    
    // Laboratoire
    service_laboratory_title: 'Laboratoire',
    service_laboratory_desc: 'Analyses cliniques et tests diagnostiques',
    service_laboratory_feature1: 'Analyses de sang',
    service_laboratory_feature2: 'Résultats rapides',
    
    // Radiographie
    service_xray_title: 'Radiographie',
    service_xray_desc: 'Imagerie et diagnostic par image',
    service_xray_feature1: 'Radiographies numériques',
    service_xray_feature2: 'Résultats immédiats',
    
    // Dentisterie
    service_dentistry_title: 'Dentisterie',
    service_dentistry_desc: 'Santé dentaire et traitements dentaires',
    service_dentistry_feature1: 'Nettoyage dentaire',
    service_dentistry_feature2: 'Orthodontie',
    
    // Psychologie
    service_psychology_title: 'Psychologie',
    service_psychology_desc: 'Soutien émotionnel et santé mentale',
    service_psychology_feature1: 'Thérapie individuelle',
    service_psychology_feature2: 'Thérapie familiale',
    service_general: 'Consultation Générale',
    service_cardiology: 'Cardiologie',
    service_pediatrics: 'Pédiatrie',
    service_dermatology: 'Dermatologie',
    service_laboratory: 'Laboratoire',
    service_xray: 'Radiographie',
    service_dentistry: 'Dentisterie',
    service_psychology: 'Psychologie',
    
    reminders_title: 'Générer un Rappel',
    reminders_subtitle: 'Créez des rappels personnalisés pour vos rendez-vous',
    
    chat_title: 'Assistant Virtuel 24/7',
    chat_placeholder: 'Tapez votre question...',
    chat_send: 'Envoyer',
    
    notif_email_sent: 'E-mail envoyé',
    notif_whatsapp_sent: 'WhatsApp envoyé',
    
    success: 'Succès',
    error: 'Erreur',
    loading: 'Chargement...'
  },
  
  pt: {
    // Login
    login_title: 'Entrar',
    login_subtitle: 'Acesse sua conta para continuar',
    login_username: 'Usuário ou Email',
    login_username_placeholder: 'admin',
    login_password: 'Senha',
    login_button: 'Entrar',
    login_loading: 'Entrando...',
    login_error_empty: 'Por favor preencha todos os campos',
    login_error_generic: 'Erro ao entrar',
    login_footer: 'Sistema de Consultas Médicas Profissional',
    logout_button: 'Sair',
    
    nav_home: 'Início',
    nav_appointments: 'Agendar Consulta',
    nav_services: 'Serviços',
    nav_reminders: 'Lembretes',
    nav_chat: 'Chat IA',
    
    // Hero Section
    hero_badge: 'Excelência em Atendimento Médico',
    hero_title_1: 'Sua Saúde nas',
    hero_title_2: 'Melhores Mãos',
    hero_subtitle: 'Atendimento médico profissional 24 horas. Agende sua consulta em segundos e receba confirmação imediata de nossa equipe de especialistas certificados.',
    hero_cta: 'Agendar Consulta Agora',
    
    // Trust Indicators
    trust_patients: 'Pacientes',
    trust_attention: 'Atendimento',
    trust_certified: 'Certificados',
    
    // Features
    feature_personalized_title: 'Atendimento Personalizado',
    feature_personalized_desc: 'Confirmações e respostas imediatas 24 horas',
    feature_email_title: 'Notificações por Email',
    feature_email_desc: 'Confirmações e lembretes por e-mail',
    feature_whatsapp_title: 'WhatsApp',
    feature_whatsapp_desc: 'Mensagens instantâneas via WhatsApp',
    feature_multilang_title: 'Multilíngue',
    feature_multilang_desc: 'Suporte em 5 idiomas: ES, EN, FR, PT, DE',
    
    // Stats
    stat_consultations: 'Consultas Realizadas',
    stat_specialists: 'Especialistas',
    stat_experience: 'Anos de Experiência',
    stat_satisfaction: '% Satisfação',
    
    // Specialties
    specialty_cardiology: 'Cardiologia',
    specialty_neurology: 'Neurologia',
    specialty_dentistry: 'Odontologia',
    
    home_title: 'Bem-vindo à Clínica MediCare',
    home_subtitle: 'Sua saúde, nossa prioridade. Atendimento médico profissional quando você precisa.',
    home_cta: 'Agendar Consulta Agora',
    
    form_title: 'Agendar Nova Consulta',
    form_name: 'Nome completo',
    form_email: 'E-mail',
    form_phone: 'Telefone (WhatsApp)',
    form_date: 'Data',
    form_time: 'Hora',
    form_service: 'Serviço',
    form_notes: 'Notas adicionais',
    form_submit: 'Agendar Consulta',
    form_loading: 'Processando...',
    
    services_title: 'Nossos Serviços Médicos',
    services_badge: 'Especialidades Médicas',
    services_subtitle: 'Temos uma equipe multidisciplinar de especialistas certificados para oferecer o melhor atendimento médico em cada área.',
    
    // Categorias de serviços
    service_category_general: 'Geral',
    service_category_specialty: 'Especialidade',
    service_category_diagnostic: 'Diagnóstico',
    service_btn_details: 'Ver detalhes',
    
    // Consulta Geral
    service_general_title: 'Consulta Geral',
    service_general_desc: 'Atendimento médico integral para todas as idades',
    service_general_feature1: 'Diagnóstico completo',
    service_general_feature2: 'Receitas médicas',
    
    // Cardiologia
    service_cardiology_title: 'Cardiologia',
    service_cardiology_desc: 'Cuidado especializado do coração',
    service_cardiology_feature1: 'Eletrocardiograma',
    service_cardiology_feature2: 'Ecocardiografia',
    
    // Pediatria
    service_pediatrics_title: 'Pediatria',
    service_pediatrics_desc: 'Atendimento médico para crianças e adolescentes',
    service_pediatrics_feature1: 'Controle de crescimento',
    service_pediatrics_feature2: 'Vacinação',
    
    // Dermatologia
    service_dermatology_title: 'Dermatologia',
    service_dermatology_desc: 'Cuidados da pele e tratamentos especializados',
    service_dermatology_feature1: 'Tratamentos faciais',
    service_dermatology_feature2: 'Dermatologia estética',
    
    // Laboratório
    service_laboratory_title: 'Laboratório',
    service_laboratory_desc: 'Análises clínicas e exames diagnósticos',
    service_laboratory_feature1: 'Análises de sangue',
    service_laboratory_feature2: 'Resultados rápidos',
    
    // Raio-X
    service_xray_title: 'Raio-X',
    service_xray_desc: 'Imagiologia e diagnóstico por imagem',
    service_xray_feature1: 'Radiografias digitais',
    service_xray_feature2: 'Resultados imediatos',
    
    // Odontologia
    service_dentistry_title: 'Odontologia',
    service_dentistry_desc: 'Saúde dental e tratamentos odontológicos',
    service_dentistry_feature1: 'Limpeza dental',
    service_dentistry_feature2: 'Ortodontia',
    
    // Psicologia
    service_psychology_title: 'Psicologia',
    service_psychology_desc: 'Apoio emocional e saúde mental',
    service_psychology_feature1: 'Terapia individual',
    service_psychology_feature2: 'Terapia familiar',
    service_general: 'Consulta Geral',
    service_cardiology: 'Cardiologia',
    service_pediatrics: 'Pediatria',
    service_dermatology: 'Dermatologia',
    service_laboratory: 'Laboratório',
    service_xray: 'Raio-X',
    service_dentistry: 'Odontologia',
    service_psychology: 'Psicologia',
    
    reminders_title: 'Gerar Lembrete',
    reminders_subtitle: 'Crie lembretes personalizados para suas consultas',
    
    chat_title: 'Assistente Virtual 24/7',
    chat_placeholder: 'Digite sua pergunta...',
    chat_send: 'Enviar',
    
    notif_email_sent: 'E-mail enviado',
    notif_whatsapp_sent: 'WhatsApp enviado',
    
    success: 'Sucesso',
    error: 'Erro',
    loading: 'Carregando...'
  },
  
  de: {
    // Login
    login_title: 'Anmelden',
    login_subtitle: 'Greifen Sie auf Ihr Konto zu, um fortzufahren',
    login_username: 'Benutzername oder E-Mail',
    login_username_placeholder: 'admin',
    login_password: 'Passwort',
    login_button: 'Anmelden',
    login_loading: 'Anmeldung...',
    login_error_empty: 'Bitte füllen Sie alle Felder aus',
    login_error_generic: 'Anmeldefehler',
    login_footer: 'Professionelles Medizinisches Terminsystem',
    logout_button: 'Abmelden',
    
    nav_home: 'Startseite',
    nav_appointments: 'Termin buchen',
    nav_services: 'Dienstleistungen',
    nav_reminders: 'Erinnerungen',
    nav_chat: 'KI-Chat',
    
    // Hero Section
    hero_badge: 'Exzellenz in der medizinischen Versorgung',
    hero_title_1: 'Ihre Gesundheit in den',
    hero_title_2: 'Besten Händen',
    hero_subtitle: 'Professionelle medizinische Versorgung rund um die Uhr. Buchen Sie Ihren Termin in Sekunden und erhalten Sie sofortige Bestätigung von unserem Team zertifizierter Spezialisten.',
    hero_cta: 'Jetzt Termin buchen',
    
    // Trust Indicators
    trust_patients: 'Patienten',
    trust_attention: 'Betreuung',
    trust_certified: 'Zertifiziert',
    
    // Features
    feature_personalized_title: 'Personalisierte Betreuung',
    feature_personalized_desc: 'Sofortige Bestätigungen und Antworten rund um die Uhr',
    feature_email_title: 'E-Mail-Benachrichtigungen',
    feature_email_desc: 'Bestätigungen und Erinnerungen per E-Mail',
    feature_whatsapp_title: 'WhatsApp',
    feature_whatsapp_desc: 'Sofortnachrichten über WhatsApp',
    feature_multilang_title: 'Mehrsprachig',
    feature_multilang_desc: 'Unterstützung in 5 Sprachen: ES, EN, FR, PT, DE',
    
    // Stats
    stat_consultations: 'Durchgeführte Konsultationen',
    stat_specialists: 'Spezialisten',
    stat_experience: 'Jahre Erfahrung',
    stat_satisfaction: '% Zufriedenheit',
    
    // Specialties
    specialty_cardiology: 'Kardiologie',
    specialty_neurology: 'Neurologie',
    specialty_dentistry: 'Zahnmedizin',
    
    home_title: 'Willkommen in der MediCare Klinik',
    home_subtitle: 'Ihre Gesundheit, unsere Priorität. Professionelle medizinische Versorgung, wenn Sie sie brauchen.',
    home_cta: 'Jetzt Termin buchen',
    
    form_title: 'Neuen Termin buchen',
    form_name: 'Vollständiger Name',
    form_email: 'E-Mail-Adresse',
    form_phone: 'Telefon (WhatsApp)',
    form_date: 'Datum',
    form_time: 'Uhrzeit',
    form_service: 'Service',
    form_notes: 'Zusätzliche Notizen',
    form_submit: 'Termin buchen',
    form_loading: 'Verarbeitung...',
    
    services_title: 'Unsere medizinischen Dienstleistungen',
    services_badge: 'Medizinische Fachbereiche',
    services_subtitle: 'Wir haben ein multidisziplinäres Team zertifizierter Spezialisten, um Ihnen die beste medizinische Versorgung in jedem Bereich zu bieten.',
    
    // Service-Kategorien
    service_category_general: 'Allgemein',
    service_category_specialty: 'Fachbereich',
    service_category_diagnostic: 'Diagnostik',
    service_btn_details: 'Details anzeigen',
    
    // Allgemeine Beratung
    service_general_title: 'Allgemeine Beratung',
    service_general_desc: 'Umfassende medizinische Versorgung für alle Altersgruppen',
    service_general_feature1: 'Vollständige Diagnose',
    service_general_feature2: 'Medizinische Verschreibungen',
    
    // Kardiologie
    service_cardiology_title: 'Kardiologie',
    service_cardiology_desc: 'Spezialisierte Herzversorgung',
    service_cardiology_feature1: 'Elektrokardiogramm',
    service_cardiology_feature2: 'Echokardiographie',
    
    // Pädiatrie
    service_pediatrics_title: 'Pädiatrie',
    service_pediatrics_desc: 'Medizinische Versorgung für Kinder und Jugendliche',
    service_pediatrics_feature1: 'Wachstumskontrolle',
    service_pediatrics_feature2: 'Impfung',
    
    // Dermatologie
    service_dermatology_title: 'Dermatologie',
    service_dermatology_desc: 'Hautpflege und spezialisierte Behandlungen',
    service_dermatology_feature1: 'Gesichtsbehandlungen',
    service_dermatology_feature2: 'Ästhetische Dermatologie',
    
    // Labor
    service_laboratory_title: 'Labor',
    service_laboratory_desc: 'Klinische Analysen und diagnostische Tests',
    service_laboratory_feature1: 'Blutanalysen',
    service_laboratory_feature2: 'Schnelle Ergebnisse',
    
    // Röntgen
    service_xray_title: 'Röntgen',
    service_xray_desc: 'Bildgebung und diagnostische Bildgebung',
    service_xray_feature1: 'Digitale Röntgenaufnahmen',
    service_xray_feature2: 'Sofortige Ergebnisse',
    
    // Zahnmedizin
    service_dentistry_title: 'Zahnmedizin',
    service_dentistry_desc: 'Zahngesundheit und zahnmedizinische Behandlungen',
    service_dentistry_feature1: 'Zahnreinigung',
    service_dentistry_feature2: 'Kieferorthopädie',
    
    // Psychologie
    service_psychology_title: 'Psychologie',
    service_psychology_desc: 'Emotionale Unterstützung und psychische Gesundheit',
    service_psychology_feature1: 'Einzeltherapie',
    service_psychology_feature2: 'Familientherapie',
    service_general: 'Allgemeine Beratung',
    service_cardiology: 'Kardiologie',
    service_pediatrics: 'Pädiatrie',
    service_dermatology: 'Dermatologie',
    service_laboratory: 'Labor',
    service_xray: 'Röntgen',
    service_dentistry: 'Zahnmedizin',
    service_psychology: 'Psychologie',
    
    reminders_title: 'Erinnerung erstellen',
    reminders_subtitle: 'Erstellen Sie personalisierte Erinnerungen für Ihre Termine',
    
    chat_title: 'Virtueller Assistent 24/7',
    chat_placeholder: 'Geben Sie Ihre Frage ein...',
    chat_send: 'Senden',
    
    notif_email_sent: 'E-Mail gesendet',
    notif_whatsapp_sent: 'WhatsApp gesendet',
    
    success: 'Erfolg',
    error: 'Fehler',
    loading: 'Laden...'
  }
};

// Idioma actual (por defecto español)
let currentLang = 'es';

/**
 * Detecta el idioma del navegador
 */
function detectLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  if (translations[langCode]) {
    return langCode;
  }
  return 'es'; // Fallback a español
}

/**
 * Obtiene una traducción
 */
function t(key) {
  return translations[currentLang][key] || key;
}

/**
 * Aplica las traducciones a todos los elementos con data-i18n
 */
function applyTranslations() {
  // Traducir elementos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);
    if (translation && translation !== key) {
      // Si es un input/textarea, traducir el placeholder
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        if (element.hasAttribute('data-i18n-placeholder')) {
          element.placeholder = translation;
        } else {
          element.value = translation;
        }
      } else if (element.tagName === 'BUTTON') {
        // Para botones, mantener el contenido HTML pero cambiar el texto
        const htmlContent = element.innerHTML;
        if (htmlContent.includes('<')) {
          // Si tiene HTML, solo cambiar el texto dentro de span si existe
          const span = element.querySelector('span');
          if (span) {
            span.textContent = translation;
          } else {
            element.textContent = translation;
          }
        } else {
          element.textContent = translation;
        }
      } else {
        element.textContent = translation;
      }
    }
  });
  
  // Traducir placeholders con data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    const translation = t(key);
    if (translation && translation !== key) {
      element.placeholder = translation;
    }
  });
  
  // Traducir títulos con data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    const translation = t(key);
    if (translation && translation !== key) {
      element.title = translation;
    }
  });
  
  console.log(`✅ Traducciones aplicadas para idioma: ${currentLang}`);
}

/**
 * Cambia el idioma y aplica las traducciones
 */
function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('medicare_lang', lang);
    applyTranslations();
    
    // Actualizar el selector de idioma si existe
    const langSelector = document.getElementById('lang-selector');
    if (langSelector && langSelector.value !== lang) {
      langSelector.value = lang;
    }
    
    console.log(`🌍 Idioma cambiado a: ${lang}`);
    return true;
  }
  return false;
}

/**
 * Obtiene el idioma actual
 */
function getCurrentLanguage() {
  return currentLang;
}

/**
 * Inicializa el sistema de idiomas
 */
function initI18n() {
  const savedLang = localStorage.getItem('medicare_lang');
  currentLang = savedLang || detectLanguage();
  
  // Aplicar traducciones cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTranslations);
  } else {
    applyTranslations();
  }
}

// Inicializar al cargar
initI18n();

// Exportar funciones
window.i18n = {
  t,
  setLanguage,
  getCurrentLanguage,
  detectLanguage,
  applyTranslations
};
