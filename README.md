# 🏥 Medicare AI - Sistema de Citas Médicas con IA

Sistema completo de gestión de citas médicas con inteligencia artificial, notificaciones automáticas y panel de administración.

## ✨ Características

- 🤖 **IA Integrada**: Confirmaciones y recordatorios generados con Groq/OpenAI
- 📅 **Gestión de Citas**: Agendar, consultar y cancelar citas
- 📧 **Notificaciones**: Email y WhatsApp automáticos
- 🔐 **Autenticación**: Sistema seguro con roles (admin/paciente)
- 📊 **Dashboard Admin**: Estadísticas y gestión completa
- 🌍 **Multiidioma**: Español e Inglés
- 📱 **Responsive**: Funciona en móvil, tablet y desktop
- 🗄️ **PostgreSQL**: Base de datos en Supabase

## 🚀 Despliegue en Vercel

### Opción 1: Importar desde GitHub (Recomendado)

1. **Sube el código a GitHub**
   - Usa GitHub Desktop o `git push`
   - Ver guía: `SUBIR_A_GITHUB.md`

2. **Importa en Vercel**
   - Ve a https://vercel.com/new
   - Selecciona tu repositorio
   - Sigue la guía: `VERCEL_SETUP.md`

3. **Configura variables de entorno**
   - 25 variables en total
   - Ver lista completa en `VERCEL_SETUP.md`

### Opción 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 🔧 Configuración Local

1. **Clonar repositorio**
```bash
git clone https://github.com/FelipilloRD/medicare-ai.git
cd medicare-ai
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
# Edita .env.local con tus credenciales
```

4. **Iniciar servidor**
```bash
npm start
```

5. **Abrir en navegador**
```
http://localhost:3002
```

## 👥 Usuarios de Prueba

### Admin
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Acceso**: Dashboard completo, todas las citas

### Paciente
- **Usuario**: `patient1`
- **Contraseña**: `patient123`
- **Acceso**: Solo sus propias citas

## 📁 Estructura del Proyecto

```
medicare-ai/
├── backend/
│   ├── server.js              # Servidor Express
│   ├── database-postgres.js   # Conexión a Supabase
│   ├── auth/                  # Autenticación
│   ├── notifications/         # Email y WhatsApp
│   └── stats/                 # Estadísticas
├── frontend/
│   ├── index.html            # Página principal
│   ├── login.html            # Login
│   ├── dashboard.html        # Panel admin
│   ├── app.js                # Lógica frontend
│   └── styles.css            # Estilos
├── vercel.json               # Config Vercel
├── package.json              # Dependencias
└── README.md                 # Este archivo
```

## 🗄️ Base de Datos

### Supabase PostgreSQL

El proyecto usa Supabase como base de datos PostgreSQL:

1. **Crear proyecto en Supabase**
   - https://supabase.com

2. **Ejecutar SQL**
   - Abre SQL Editor
   - Ejecuta `setup-supabase-completo.sql`

3. **Obtener credenciales**
   - Project Settings → Database
   - Copia Connection String

## 🔑 Variables de Entorno

Ver archivo `.env.example` para la lista completa.

### Esenciales:
- `DATABASE_URL` - Conexión a Supabase
- `GROQ_API_KEY` - IA gratis (recomendado)
- `SESSION_SECRET` - Seguridad de sesiones
- `SMTP_USER` / `SMTP_PASS` - Email
- `TWILIO_*` - WhatsApp (opcional)

## 📧 Configuración de Email

### Gmail:
1. Activa verificación en 2 pasos
2. Genera contraseña de aplicación
3. Usa en `SMTP_PASS`

## 📱 Configuración de WhatsApp

### Twilio:
1. Crea cuenta en https://twilio.com
2. Activa WhatsApp Sandbox
3. Copia credenciales

## 🛠️ Tecnologías

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, JavaScript
- **Base de Datos**: PostgreSQL (Supabase)
- **IA**: Groq (Llama 3), OpenAI (GPT-3.5)
- **Notificaciones**: Nodemailer, Twilio
- **Hosting**: Vercel
- **Autenticación**: Express Session, bcrypt

## 📊 Funcionalidades

### Para Pacientes:
- ✅ Agendar citas
- ✅ Ver sus citas
- ✅ Cancelar citas
- ✅ Chat con IA
- ✅ Información de servicios

### Para Administradores:
- ✅ Dashboard con estadísticas
- ✅ Ver todas las citas
- ✅ Gestionar recordatorios
- ✅ Enviar notificaciones
- ✅ Backups de datos

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Sesiones seguras con express-session
- ✅ Protección CSRF
- ✅ Validación de roles
- ✅ SSL/TLS en producción

## 📝 Licencia

MIT License - Uso libre para proyectos personales y comerciales

## 👨‍💻 Autor

**Felipe Rodriguez**
- GitHub: [@FelipilloRD](https://github.com/FelipilloRD)
- Email: felipinksi@gmail.com

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📞 Soporte

¿Problemas con el despliegue?
1. Revisa `VERCEL_SETUP.md`
2. Verifica logs en Vercel
3. Confirma variables de entorno
4. Revisa conexión a Supabase

## 🎉 Demo

**URL de producción**: https://medicare-ai-liard.vercel.app

**Credenciales de prueba**:
- Admin: `admin` / `admin123`
- Paciente: `patient1` / `patient123`

---

Hecho con ❤️ por Felipe Rodriguez
