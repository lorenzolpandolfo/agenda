CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE psychologists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    crp VARCHAR(20) UNIQUE NOT NULL, -- Conselho Regional de Psicologia
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE availabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    psychologist_id UUID NOT NULL,
    day_of_week INT NOT NULL, -- 1 (Monday) to 6 (Saturday)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_psychologist FOREIGN KEY(psychologist_id) REFERENCES psychologists(id) ON DELETE CASCADE,
    UNIQUE(psychologist_id, day_of_week)
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    psychologist_id UUID NOT NULL,
    appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled', -- e.g., scheduled, completed, canceled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_client FOREIGN KEY(client_id) REFERENCES clients(id),
    CONSTRAINT fk_psychologist FOREIGN KEY(psychologist_id) REFERENCES psychologists(id),
    UNIQUE(psychologist_id, appointment_time) -- Business Rule: Prevents double booking
);

CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_psychologist ON appointments(psychologist_id);
CREATE INDEX idx_availabilities_psychologist ON availabilities(psychologist_id);



-- Insert Psychologists
INSERT INTO psychologists (name, email, crp) VALUES
('Dr. Ana Silva', 'ana.silva@email.com', 'CRP/01-12345'),
('Dr. Carlos Souza', 'carlos.souza@email.com', 'CRP/02-54321');

-- Insert Clients
INSERT INTO clients (name, email, phone) VALUES
('João Pereira', 'joao.p@email.com', '11987654321'),
('Maria Oliveira', 'maria.o@email.com', '21912345678');

-- Define Availabilities for Dr. Ana Silva (Monday and Wednesday, 9h to 18h)
INSERT INTO availabilities (psychologist_id, day_of_week, start_time, end_time)
SELECT id, 1, '09:00:00', '18:00:00' FROM psychologists WHERE email = 'ana.silva@email.com';
INSERT INTO availabilities (psychologist_id, day_of_week, start_time, end_time)
SELECT id, 3, '09:00:00', '18:00:00' FROM psychologists WHERE email = 'ana.silva@email.com';

-- Define Availabilities for Dr. Carlos Souza (Tuesday and Thursday, 8h to 17h)
INSERT INTO availabilities (psychologist_id, day_of_week, start_time, end_time)
SELECT id, 2, '08:00:00', '17:00:00' FROM psychologists WHERE email = 'carlos.souza@email.com';
INSERT INTO availabilities (psychologist_id, day_of_week, start_time, end_time)
SELECT id, 4, '08:00:00', '17:00:00' FROM psychologists WHERE email = 'carlos.souza@email.com';

-- Insert a pre-existing appointment for Dr. Ana Silva with João Pereira
INSERT INTO appointments (client_id, psychologist_id, appointment_time)
SELECT c.id, p.id, NOW() + INTERVAL '3 day'
FROM clients c, psychologists p
WHERE c.email = 'joao.p@email.com'
  AND p.email = 'ana.silva@email.com';

