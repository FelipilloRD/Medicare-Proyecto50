# 🚀 GUÍA DE DESPLIEGUE EN VERCEL

Esta guía te ayudará a desplegar Medicare AI en Vercel desde GitHub.

## 📋 PRE-REQUISITOS

1. ✅ Cuenta de GitHub con el repositorio `medicare-ai`
2. ✅ Cuenta de Vercel (https://vercel.com)
3. ✅ Base de datos Supabase configurada
4. ✅ Credenciales de API (Groq, OpenAI, Gmail, Twilio)

## 🔧 PASO 1: PREPARAR GITHUB

1. Asegúrate de que todos los archivos estén en GitHub:
   - `backend/` - Código del servidor
   - `frontend/` - Archivos HTML/CSS/JS
   - `vercel.json` - Configuración de Vercel
   - `package.json` - Dependencias
   - `.gitignore` - Archivos a ignorar

2. **NO subas** archivos `.env` con credenciales reales

## 🌐 PASO 2: IMPORTAR EN VERCEL

1. Ve a https://vercel.com/new
2. Haz clic en **"Import Git Repository"**
3. Selecciona tu repositorio `medicare-ai`
4. Haz clic en **"Import"**

## ⚙️ PASO 3: CONFIGURAR VARIABLES DE ENTORNO

En la pantalla de configuración, haz clic en **"Environment Variables"** y agrega:

### 🗄️ Base de Datos (4 variables)

```
DATABASE_URL = postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT-REF.supabase.co:5432/postgres
SUPABASE_URL = https://YOUR-PROJECT-REF.supabase.co
SUPABASE_ANON_KEY = your-supabase-anon-key-here
DB_SSL = true
```

### 🤖 IA - Groq (3 variables)

```
GROQ_API_KEY = your-groq-api-key-here
GROQ_MODEL = llama-3.1-8b-instant
GROQ_MAX_TOKENS = 500
```

### 🤖 IA - OpenAI (3 variables)

```
OPENAI_API_KEY = your-openai-api-key-here
OPENAI_MODEL = gpt-3.5-turbo
OPENAI_MAX_TOKENS = 500
```

### ⚙️ Servidor (2 variables)

```
PORT = 3002
NODE_ENV = production
```

### 🔐 Seguridad (2 variables)

```
SESSION_SECRET = medicare-ai-secret-key-change-in-production-2026
CSRF_SECRET = medicare-ai-csrf-secret-change-in-production-2026
```

### 📧 Email (4 variables)

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your-email@gmail.com
SMTP_PASS = your-gmail-app-password-here
```

### 📱 WhatsApp (3 variables)

```
TWILIO_ACCOUNT_SID = your-twilio-account-sid-here
TWILIO_AUTH_TOKEN = your-twilio-auth-token-here
TWILIO_WHATSAPP_FROM = whatsapp:+14155238886
```

### 🏥 Clínica (4 variables)

```
CLINIC_NAME = MediCare AI
CLINIC_PHONE = +1 829 555 0000
CLINIC_EMAIL = info@medicare-ai.com
CLINIC_ADDRESS = Av. Principal 123, Santo Domingo, RD
```

**TOTAL: 25 variables de entorno**

## 🔒 MARCAR COMO SENSITIVE

Marca como **"Sensitive"** (ocultar valor) las siguientes variables:

- ✅ DATABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ GROQ_API_KEY
- ✅ OPENAI_API_KEY
- ✅ SESSION_SECRET
- ✅ CSRF_SECRET
- ✅ SMTP_USER
- ✅ SMTP_PASS
- ✅ TWILIO_ACCOUNT_SID
- ✅ TWILIO_AUTH_TOKEN
- ✅ TWILIO_WHATSAPP_FROM

## 🚀 PASO 4: DESPLEGAR

1. Después de agregar todas las variables, haz clic en **"Deploy"**
2. Espera a que termine el despliegue (2-3 minutos)
3. Vercel te dará una URL como: `https://medicare-ai-xxx.vercel.app`

## ✅ PASO 5: VERIFICAR

1. Ve a tu URL de Vercel
2. Haz clic en **"Login"**
3. Prueba con:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`
4. Deberías entrar al sistema correctamente

## 🔧 SOLUCIÓN DE PROBLEMAS

### ❌ Error: "Username or password is incorrect"

**Causa**: La base de datos no está conectada o las credenciales son incorrectas.

**Solución**:
1. Verifica que `DATABASE_URL` tenga la contraseña correcta
2. Ve a Supabase y confirma que la base de datos esté activa
3. Ejecuta el script SQL en Supabase SQL Editor (ver `setup-supabase-completo.sql`)

### ❌ Error: "Cannot find module"

**Causa**: Falta alguna dependencia en `package.json`.

**Solución**:
1. Ve a Vercel → Settings → General
2. Haz clic en **"Redeploy"**

### ❌ Error: "404 Not Found"

**Causa**: Las rutas no están configuradas correctamente.

**Solución**:
1. Verifica que `vercel.json` esté en la raíz del proyecto
2. Asegúrate de que la carpeta `frontend/` exista

## 📞 SOPORTE

Si tienes problemas:
1. Revisa los logs en Vercel → Deployments → [tu deployment] → Logs
2. Verifica que todas las 25 variables estén configuradas
3. Confirma que la base de datos Supabase esté activa

## 🎉 ¡LISTO!

Tu aplicación Medicare AI ahora está desplegada en Vercel con:
- ✅ Backend Node.js + Express
- ✅ Frontend HTML/CSS/JS
- ✅ Base de datos PostgreSQL (Supabase)
- ✅ IA con Groq (gratis)
- ✅ Notificaciones por Email y WhatsApp
- ✅ Autenticación segura con sesiones

**URL de producción**: https://medicare-ai-liard.vercel.app
