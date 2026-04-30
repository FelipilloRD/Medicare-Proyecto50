-- ═══════════════════════════════════════════════════════════════
-- MediCare AI - PostgreSQL Database Schema
-- Compatible con Supabase
-- ═══════════════════════════════════════════════════════════════

-- Eliminar tablas si existen (para desarrollo)
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- TABLA: users
-- Usuarios del sistema (admin y pacientes)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- Hash bcrypt
    role VARCHAR(20) NOT NULL DEFAULT 'patient',  -- 'admin' o 'patient'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: appointments
-- Citas médicas
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    date DATE NOT NULL,
    time TIME NOT NULL,
    service VARCHAR(255) NOT NULL,
    notes TEXT,
    ai_confirmation TEXT,
    lang VARCHAR(10) DEFAULT 'es',
    status VARCHAR(50) DEFAULT 'scheduled',  -- 'scheduled', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas y filtros
CREATE INDEX idx_appointments_email ON appointments(email);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_service ON appointments(service);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_at ON appointments(created_at);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: reminders
-- Recordatorios de citas
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    lang VARCHAR(10) DEFAULT 'es',
    message TEXT NOT NULL,
    auto BOOLEAN DEFAULT false,  -- true si fue generado automáticamente
    sent BOOLEAN DEFAULT false,  -- true si ya fue enviado
    sent_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_reminders_appointment_id ON reminders(appointment_id);
CREATE INDEX idx_reminders_date ON reminders(date);
CREATE INDEX idx_reminders_sent ON reminders(sent);
CREATE INDEX idx_reminders_created_by ON reminders(created_by);

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS: Actualizar updated_at automáticamente
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- DATOS INICIALES: Usuarios por defecto
-- ═══════════════════════════════════════════════════════════════
INSERT INTO users (username, email, password, role) VALUES
    ('admin', 'admin@medicare-ai.com', '$2b$10$Rz0qF1Gbm216vZOFQ/CDYu3rBmeKeHHaDa6bhtKb5xTc0iVjEQbIi', 'admin'),
    ('patient1', 'patient1@example.com', '$2b$10$zrIR7x0hp5yA/p2USHJb9OpSU5As7TGLXW7k3XF8lrOpSYyDa96fK', 'patient');

-- ═══════════════════════════════════════════════════════════════
-- VISTAS: Para estadísticas y reportes
-- ═══════════════════════════════════════════════════════════════

-- Vista: Citas próximas (siguientes 7 días)
CREATE OR REPLACE VIEW upcoming_appointments AS
SELECT 
    id, name, email, phone, date, time, service, status
FROM appointments
WHERE date >= CURRENT_DATE 
  AND date <= CURRENT_DATE + INTERVAL '7 days'
  AND status = 'scheduled'
ORDER BY date, time;

-- Vista: Estadísticas por servicio
CREATE OR REPLACE VIEW appointments_by_service AS
SELECT 
    service,
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
FROM appointments
GROUP BY service
ORDER BY total_appointments DESC;

-- Vista: Recordatorios pendientes
CREATE OR REPLACE VIEW pending_reminders AS
SELECT 
    r.id, r.name, r.service, r.date, r.message, r.auto,
    a.email, a.phone
FROM reminders r
LEFT JOIN appointments a ON r.appointment_id = a.id
WHERE r.sent = false
ORDER BY r.date;

-- ═══════════════════════════════════════════════════════════════
-- FUNCIONES: Búsqueda y utilidades
-- ═══════════════════════════════════════════════════════════════

-- Función: Buscar citas por texto
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
    status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id, a.name, a.email, a.phone, a.date, a.time AS appointment_time, 
        a.service, a.notes, a.status
    FROM appointments a
    WHERE 
        a.name ILIKE '%' || search_query || '%' OR
        a.email ILIKE '%' || search_query || '%' OR
        a.phone ILIKE '%' || search_query || '%' OR
        a.service ILIKE '%' || search_query || '%' OR
        a.notes ILIKE '%' || search_query || '%'
    ORDER BY a.date DESC, a.time DESC;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- PERMISOS: Para Supabase (Row Level Security)
-- ═══════════════════════════════════════════════════════════════

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias citas
CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT
    USING (email = current_setting('app.current_user_email', true));

-- Política: Los admins pueden ver todas las citas
CREATE POLICY "Admins can view all appointments" ON appointments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE email = current_setting('app.current_user_email', true) 
            AND role = 'admin'
        )
    );

-- Política: Los usuarios pueden crear sus propias citas
CREATE POLICY "Users can create own appointments" ON appointments
    FOR INSERT
    WITH CHECK (email = current_setting('app.current_user_email', true));

-- Política: Los usuarios pueden actualizar sus propias citas
CREATE POLICY "Users can update own appointments" ON appointments
    FOR UPDATE
    USING (email = current_setting('app.current_user_email', true));

-- Política: Los usuarios pueden eliminar sus propias citas
CREATE POLICY "Users can delete own appointments" ON appointments
    FOR DELETE
    USING (email = current_setting('app.current_user_email', true));

-- ═══════════════════════════════════════════════════════════════
-- COMENTARIOS: Documentación de la base de datos
-- ═══════════════════════════════════════════════════════════════

COMMENT ON TABLE users IS 'Usuarios del sistema (administradores y pacientes)';
COMMENT ON TABLE appointments IS 'Citas médicas programadas';
COMMENT ON TABLE reminders IS 'Recordatorios de citas (automáticos y manuales)';

COMMENT ON COLUMN users.password IS 'Hash bcrypt de la contraseña';
COMMENT ON COLUMN users.role IS 'Rol del usuario: admin o patient';
COMMENT ON COLUMN appointments.ai_confirmation IS 'Mensaje de confirmación generado por IA';
COMMENT ON COLUMN reminders.auto IS 'true si fue generado automáticamente por IA';
COMMENT ON COLUMN reminders.sent IS 'true si el recordatorio ya fue enviado';

-- ═══════════════════════════════════════════════════════════════
-- FIN DEL SCHEMA
-- ═══════════════════════════════════════════════════════════════