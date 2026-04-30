-- ═══════════════════════════════════════════════════════════════
-- MediCare AI - PostgreSQL Database Schema (OPTIMIZADO)
-- Compatible con Supabase
-- Versión: 2.0 - Optimizado para registro público y autenticación por email
-- ═══════════════════════════════════════════════════════════════

-- Eliminar objetos existentes (solo para desarrollo/reset)
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS search_appointments(TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- TABLA: users
-- Usuarios del sistema con autenticación por email
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,  -- Generado automáticamente desde email
    email VARCHAR(255) UNIQUE NOT NULL,     -- Email único (usado para login)
    password VARCHAR(255) NOT NULL,         -- Hash bcrypt (mínimo 8 caracteres)
    role VARCHAR(20) NOT NULL DEFAULT 'patient' CHECK (role IN ('admin', 'patient')),
    full_name VARCHAR(255),                 -- Nombre completo (opcional)
    phone VARCHAR(50),                      -- Teléfono (opcional)
    is_active BOOLEAN DEFAULT true,         -- Cuenta activa
    email_verified BOOLEAN DEFAULT false,   -- Email verificado
    last_login TIMESTAMP,                   -- Último inicio de sesión
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices optimizados para búsquedas frecuentes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role) WHERE is_active = true;
CREATE INDEX idx_users_active ON users(is_active);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: appointments
-- Citas médicas con soporte multiidioma
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- Usuario que creó la cita (opcional)
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,            -- Email del paciente
    phone VARCHAR(50),
    date DATE NOT NULL,
    time TIME NOT NULL,
    service VARCHAR(255) NOT NULL,
    notes TEXT,
    ai_confirmation TEXT,                   -- Confirmación generada por IA
    lang VARCHAR(10) DEFAULT 'es' CHECK (lang IN ('es', 'en', 'fr', 'pt', 'de')),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),
    cancellation_reason TEXT,               -- Razón de cancelación (si aplica)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: La cita debe ser en el futuro (al momento de creación)
    CONSTRAINT future_appointment CHECK (date >= CURRENT_DATE)
);

-- Índices optimizados
CREATE INDEX idx_appointments_email ON appointments(email);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(date) WHERE status IN ('scheduled', 'confirmed');
CREATE INDEX idx_appointments_date_time ON appointments(date, time);
CREATE INDEX idx_appointments_service ON appointments(service);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_at ON appointments(created_at DESC);

-- Índice compuesto para búsquedas de usuario
CREATE INDEX idx_appointments_email_date ON appointments(email, date DESC);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: reminders
-- Recordatorios de citas (automáticos y manuales)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    lang VARCHAR(10) DEFAULT 'es',
    message TEXT NOT NULL,
    auto BOOLEAN DEFAULT false,             -- true = generado por IA automáticamente
    sent BOOLEAN DEFAULT false,             -- true = ya fue enviado
    sent_at TIMESTAMP,                      -- Fecha/hora de envío
    send_method VARCHAR(50),                -- 'email', 'whatsapp', 'both'
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_reminders_appointment_id ON reminders(appointment_id);
CREATE INDEX idx_reminders_date ON reminders(date);
CREATE INDEX idx_reminders_sent ON reminders(sent) WHERE sent = false;
CREATE INDEX idx_reminders_created_by ON reminders(created_by);
CREATE INDEX idx_reminders_auto ON reminders(auto);

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS: Actualizar updated_at automáticamente
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- VISTAS: Para estadísticas y reportes
-- ═══════════════════════════════════════════════════════════════

-- Vista: Citas próximas (siguientes 7 días)
CREATE OR REPLACE VIEW upcoming_appointments AS
SELECT 
    a.id, a.name, a.email, a.phone, a.date, a.time, a.service, 
    a.status, a.lang, a.created_at,
    u.full_name as created_by_name
FROM appointments a
LEFT JOIN users u ON a.user_id = u.id
WHERE a.date >= CURRENT_DATE 
  AND a.date <= CURRENT_DATE + INTERVAL '7 days'
  AND a.status IN ('scheduled', 'confirmed')
ORDER BY a.date, a.time;

-- Vista: Estadísticas por servicio
CREATE OR REPLACE VIEW appointments_by_service AS
SELECT 
    service,
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
    COUNT(CASE WHEN status = 'no-show' THEN 1 END) as no_show,
    ROUND(AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100, 2) as completion_rate
FROM appointments
GROUP BY service
ORDER BY total_appointments DESC;

-- Vista: Recordatorios pendientes con información de contacto
CREATE OR REPLACE VIEW pending_reminders AS
SELECT 
    r.id, r.name, r.service, r.date, r.message, r.auto,
    r.created_at,
    a.email, a.phone, a.lang, a.time as appointment_time
FROM reminders r
LEFT JOIN appointments a ON r.appointment_id = a.id
WHERE r.sent = false
  AND r.date >= CURRENT_DATE
ORDER BY r.date, a.time;

-- Vista: Estadísticas de usuarios
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id, u.username, u.email, u.full_name, u.role,
    u.created_at, u.last_login,
    COUNT(a.id) as total_appointments,
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
    COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments,
    MAX(a.date) as last_appointment_date
FROM users u
LEFT JOIN appointments a ON u.email = a.email
WHERE u.is_active = true
GROUP BY u.id, u.username, u.email, u.full_name, u.role, u.created_at, u.last_login
ORDER BY u.created_at DESC;

-- ═══════════════════════════════════════════════════════════════
-- FUNCIONES: Búsqueda y utilidades
-- ═══════════════════════════════════════════════════════════════

-- Función: Buscar citas por texto (búsqueda full-text)
CREATE OR REPLACE FUNCTION search_appointments(search_query TEXT)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    date DATE,
    appointment_time TIME,
    service VARCHAR,
    notes TEXT,
    status VARCHAR,
    relevance INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id, a.name, a.email, a.phone, a.date, a.time AS appointment_time, 
        a.service, a.notes, a.status,
        (
            CASE WHEN a.name ILIKE '%' || search_query || '%' THEN 3 ELSE 0 END +
            CASE WHEN a.email ILIKE '%' || search_query || '%' THEN 2 ELSE 0 END +
            CASE WHEN a.service ILIKE '%' || search_query || '%' THEN 2 ELSE 0 END +
            CASE WHEN a.phone ILIKE '%' || search_query || '%' THEN 1 ELSE 0 END +
            CASE WHEN a.notes ILIKE '%' || search_query || '%' THEN 1 ELSE 0 END
        ) AS relevance
    FROM appointments a
    WHERE 
        a.name ILIKE '%' || search_query || '%' OR
        a.email ILIKE '%' || search_query || '%' OR
        a.phone ILIKE '%' || search_query || '%' OR
        a.service ILIKE '%' || search_query || '%' OR
        a.notes ILIKE '%' || search_query || '%'
    ORDER BY relevance DESC, a.date DESC, a.time DESC;
END;
$$ LANGUAGE plpgsql;

-- Función: Obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM users WHERE is_active = true),
        'total_appointments', (SELECT COUNT(*) FROM appointments),
        'upcoming_appointments', (SELECT COUNT(*) FROM appointments WHERE date >= CURRENT_DATE AND status IN ('scheduled', 'confirmed')),
        'completed_appointments', (SELECT COUNT(*) FROM appointments WHERE status = 'completed'),
        'pending_reminders', (SELECT COUNT(*) FROM reminders WHERE sent = false),
        'today_appointments', (SELECT COUNT(*) FROM appointments WHERE date = CURRENT_DATE AND status IN ('scheduled', 'confirmed'))
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- DATOS INICIALES: Usuario admin por defecto
-- ═══════════════════════════════════════════════════════════════

-- Insertar usuario admin (contraseña: admin123)
INSERT INTO users (username, email, password, role, full_name, is_active, email_verified) VALUES
    ('admin', 'admin@medicare-ai.com', '$2b$10$0N8W1zQ97BzReRKCXqw7LutpDezL2DSfCijI1i1wwLzeTLyoJqn4m', 'admin', 'Administrador', true, true)
ON CONFLICT (email) DO NOTHING;

-- Insertar usuario de prueba (contraseña: patient123)
INSERT INTO users (username, email, password, role, full_name, is_active, email_verified) VALUES
    ('patient1', 'patient1@example.com', '$2b$10$FUR7nqgq5v4mV65dwKDnKehDbhWoJzUEjqIE7lddyNH4nRDDKJtdC', 'patient', 'Paciente de Prueba', true, true)
ON CONFLICT (email) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- COMENTARIOS: Documentación de la base de datos
-- ═══════════════════════════════════════════════════════════════

COMMENT ON TABLE users IS 'Usuarios del sistema - Registro público por email';
COMMENT ON TABLE appointments IS 'Citas médicas - Cualquier usuario autenticado puede crear';
COMMENT ON TABLE reminders IS 'Recordatorios automáticos y manuales';

COMMENT ON COLUMN users.password IS 'Hash bcrypt - Mínimo 8 caracteres';
COMMENT ON COLUMN users.username IS 'Generado automáticamente desde email (parte antes de @)';
COMMENT ON COLUMN users.email IS 'Email único - Usado para login y comunicación';
COMMENT ON COLUMN appointments.ai_confirmation IS 'Mensaje de confirmación generado por IA (Groq/OpenAI)';
COMMENT ON COLUMN appointments.user_id IS 'Usuario que creó la cita (puede ser NULL para citas antiguas)';
COMMENT ON COLUMN reminders.auto IS 'true = Generado automáticamente por IA después de crear cita';

-- ═══════════════════════════════════════════════════════════════
-- VERIFICACIÓN: Consultas para verificar que todo funciona
-- ═══════════════════════════════════════════════════════════════

-- Verificar usuarios creados
SELECT 'Usuarios creados:' as info, COUNT(*) as count FROM users;

-- Verificar estructura de tablas
SELECT 'Tablas creadas:' as info, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Verificar vistas creadas
SELECT 'Vistas creadas:' as info, COUNT(*) as count 
FROM information_schema.views 
WHERE table_schema = 'public';

-- Verificar funciones creadas
SELECT 'Funciones creadas:' as info, COUNT(*) as count 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- ═══════════════════════════════════════════════════════════════
-- FIN DEL SCHEMA OPTIMIZADO
-- ═══════════════════════════════════════════════════════════════

-- Para ejecutar este schema en Supabase:
-- 1. Ve a SQL Editor en Supabase
-- 2. Copia y pega todo este archivo
-- 3. Click en "Run" o presiona Ctrl+Enter
-- 4. Verifica que no haya errores
-- 5. Los usuarios admin y patient1 estarán listos para usar
