# 🚀 Guía de Migración a PostgreSQL

## 📋 Requisitos Previos

### 1. Instalar PostgreSQL

**Windows:**
```bash
# Descargar desde: https://www.postgresql.org/download/windows/
# O usar Chocolatey:
choco install postgresql
```

**Verificar instalación:**
```bash
psql --version
```

### 2. Instalar dependencias Node.js

```bash
cd clinica-ai
npm install
```

Esto instalará `pg` (driver de PostgreSQL para Node.js).

---

## 🗄️ Configuración de PostgreSQL

### Paso 1: Crear la base de datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE medicare_ai;

# Salir
\q
```

### Paso 2: Ejecutar el schema

```bash
# Opción 1: Desde la terminal
psql -U postgres -d medicare_ai -f backend/schema.sql

# Opción 2: Desde psql
psql -U postgres -d medicare_ai
\i backend/schema.sql
\q
```

### Paso 3: Configurar variables de entorno

Edita el archivo `.env` y configura:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medicare_ai
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_SSL=false
```

---

## 🔄 Migrar Datos de JSON a PostgreSQL

### Opción 1: Script automático (Recomendado)

```bash
npm run migrate
```

Este script:
- ✅ Lee los archivos JSON existentes
- ✅ Migra usuarios, citas y recordatorios
- ✅ Verifica la migración
- ✅ Muestra un resumen

### Opción 2: Manual

```bash
node backend/migrate-to-postgres.js
```

---

## 🚀 Usar PostgreSQL en el Servidor

### Cambiar a PostgreSQL

Edita `backend/server.js` y cambia la línea:

```javascript
// ANTES (JSON):
const database = require('./database');

// DESPUÉS (PostgreSQL):
const database = require('./database-postgres');
```

### Iniciar el servidor

```bash
npm start
```

---

## 🧪 Verificar que Funciona

### 1. Test de conexión

```bash
node -e "require('./backend/database-postgres').testConnection()"
```

### 2. Verificar datos

```bash
psql -U postgres -d medicare_ai

-- Ver usuarios
SELECT * FROM users;

-- Ver citas
SELECT * FROM appointments;

-- Ver recordatorios
SELECT * FROM reminders;

-- Salir
\q
```

### 3. Probar la aplicación

1. Inicia el servidor: `npm start`
2. Abre: `http://localhost:3002`
3. Login con: `admin` / `admin123`
4. Verifica que todo funcione igual

---

## 📊 Ventajas de PostgreSQL vs JSON

| Característica | JSON | PostgreSQL |
|----------------|------|------------|
| **Velocidad** | Lenta con muchos datos | Rápida siempre |
| **Búsquedas** | Lentas | Optimizadas con índices |
| **Relaciones** | Manual | Automáticas (FK) |
| **Transacciones** | No | Sí (ACID) |
| **Backups** | Manual | Automáticos |
| **Escalabilidad** | Limitada | Excelente |
| **Supabase** | ❌ No compatible | ✅ Compatible |

---

## 🌐 Preparar para Supabase

### 1. Crear proyecto en Supabase

1. Ve a: https://supabase.com
2. Crea una cuenta
3. Crea un nuevo proyecto
4. Copia la **Connection String**

### 2. Configurar .env para Supabase

```env
# Comentar configuración local:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=medicare_ai
# DB_USER=postgres
# DB_PASSWORD=postgres

# Usar connection string de Supabase:
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
DB_SSL=true
```

### 3. Actualizar database-postgres.js

Cambia la configuración del Pool:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

### 4. Ejecutar schema en Supabase

1. Ve al **SQL Editor** en Supabase
2. Copia y pega el contenido de `backend/schema.sql`
3. Ejecuta

### 5. Migrar datos

```bash
npm run migrate
```

---

## 🚀 Deploy en Vercel

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Configurar vercel.json

Ya está creado en el proyecto.

### 3. Deploy

```bash
vercel
```

### 4. Configurar variables de entorno en Vercel

En el dashboard de Vercel, agrega:
- `DATABASE_URL`
- `GROQ_API_KEY`
- `SMTP_USER`
- `SMTP_PASS`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- Etc.

---

## 🔧 Comandos Útiles

```bash
# Iniciar servidor
npm start

# Migrar datos
npm run migrate

# Conectar a PostgreSQL
psql -U postgres -d medicare_ai

# Ver tablas
\dt

# Ver estructura de tabla
\d users
\d appointments
\d reminders

# Backup de base de datos
pg_dump -U postgres medicare_ai > backup.sql

# Restaurar backup
psql -U postgres -d medicare_ai < backup.sql
```

---

## ❓ Troubleshooting

### Error: "password authentication failed"

```bash
# Cambiar contraseña de postgres
psql -U postgres
ALTER USER postgres PASSWORD 'nueva_contraseña';
\q
```

### Error: "database does not exist"

```bash
psql -U postgres
CREATE DATABASE medicare_ai;
\q
```

### Error: "relation does not exist"

```bash
# Ejecutar el schema nuevamente
psql -U postgres -d medicare_ai -f backend/schema.sql
```

### Error: "port 5432 already in use"

PostgreSQL ya está corriendo. Verifica con:
```bash
# Windows
netstat -ano | findstr :5432

# Ver servicios
services.msc
# Buscar "postgresql"
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica que PostgreSQL esté corriendo
3. Verifica las credenciales en `.env`
4. Prueba la conexión con `testConnection()`

---

## ✅ Checklist de Migración

- [ ] PostgreSQL instalado
- [ ] Base de datos `medicare_ai` creada
- [ ] Schema ejecutado (`schema.sql`)
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Dependencias instaladas (`npm install`)
- [ ] Datos migrados (`npm run migrate`)
- [ ] Servidor actualizado (`database-postgres.js`)
- [ ] Aplicación probada y funcionando
- [ ] (Opcional) Proyecto Supabase creado
- [ ] (Opcional) Deploy en Vercel

---

**¡Listo! Tu aplicación ahora usa PostgreSQL y está lista para Supabase + Vercel** 🎉
