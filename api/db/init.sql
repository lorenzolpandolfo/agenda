CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (patients and professionals)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- PATIENT / PROFESSIONAL
    status VARCHAR(50) NOT NULL, -- READY / WAITING_VALIDATION
    crp VARCHAR(20) UNIQUE, -- só para PROFESSIONAL
    phone VARCHAR(20),
    bio TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Availabilities (horários disponíveis para profissionais)
CREATE TABLE availabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL, -- PROFESSIONAL
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- AVAILABLE / TAKEN / COMPLETED / CANCELED
    CONSTRAINT fk_owner FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(owner_id, start_time, end_time)
);

-- Schedule (consultas agendadas)
CREATE TABLE schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    availability_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_professional FOREIGN KEY(professional_id) REFERENCES users(id),
    CONSTRAINT fk_patient FOREIGN KEY(patient_id) REFERENCES users(id),
    CONSTRAINT fk_availability FOREIGN KEY(availability_id) REFERENCES availabilities(id),
    UNIQUE(availability_id)
);

CREATE INDEX idx_schedule_patient ON schedule(patient_id);
CREATE INDEX idx_schedule_professional ON schedule(professional_id);
CREATE INDEX idx_availabilities_owner ON availabilities(owner_id);

-- Insert Users
INSERT INTO users (name, email, password_hash, role, status, crp)
VALUES
('Dr. Ana Silva', 'ana.silva@email.com', '$2b$12$9vh0QQQBwfstXX36RgsNUejr4M.zMPXTqDjbNjlBxcxd/s/ZHI.Ga', 'PROFESSIONAL', 'READY', 'CRP/01-12345'),
('Dr. Carlos Souza', 'carlos.souza@email.com', '$2b$12$9vh0QQQBwfstXX36RgsNUejr4M.zMPXTqDjbNjlBxcxd/s/ZHI.Ga', 'PROFESSIONAL', 'READY', 'CRP/02-54321'),
('João Pereira', 'joao.p@email.com', '$2b$12$9vh0QQQBwfstXX36RgsNUejr4M.zMPXTqDjbNjlBxcxd/s/ZHI.Ga', 'PATIENT', 'READY', NULL),
('Maria Oliveira', 'maria.o@email.com', '$2b$12$9vh0QQQBwfstXX36RgsNUejr4M.zMPXTqDjbNjlBxcxd/s/ZHI.Ga', 'PATIENT', 'READY', NULL),
('Lorenzo Pandolfo', 'lorenzo.p@email.com', '$2b$12$9vh0QQQBwfstXX36RgsNUejr4M.zMPXTqDjbNjlBxcxd/s/ZHI.Ga', 'PATIENT', 'READY', NULL),
('Beatriz Lima', 'beatriz.l@email.com', '$2b$12$9vh0QQQBwfstXX36RgsNUejr4M.zMPXTqDjbNjlBxcxd/s/ZHI.Ga', 'PROFESSIONAL', 'WAITING_VALIDATION', 'CRP/03-98765');

-- Insert Availabilities
-- Dr. Ana Silva
INSERT INTO availabilities (owner_id, start_time, end_time)
SELECT id, '2025-09-01 09:00:00+00', '2025-09-01 10:00:00+00' FROM users WHERE email = 'ana.silva@email.com';
INSERT INTO availabilities (owner_id, start_time, end_time)
SELECT id, '2025-09-03 09:00:00+00', '2025-09-03 10:00:00+00' FROM users WHERE email = 'ana.silva@email.com';

-- Dr. Carlos Souza
INSERT INTO availabilities (owner_id, start_time, end_time)
SELECT id, '2025-09-02 08:00:00+00', '2025-09-02 09:00:00+00' FROM users WHERE email = 'carlos.souza@email.com';
INSERT INTO availabilities (owner_id, start_time, end_time)
SELECT id, '2025-09-04 08:00:00+00', '2025-09-04 09:00:00+00' FROM users WHERE email = 'carlos.souza@email.com';

-- Beatriz Lima (em validação, não vai ter agendamentos ainda)
INSERT INTO availabilities (owner_id, start_time, end_time)
SELECT id, '2025-09-05 10:00:00+00', '2025-09-05 11:00:00+00' FROM users WHERE email = 'beatriz.l@email.com';

-- Agendamentos
-- João Pereira com Dr. Ana Silva (usa a primeira disponibilidade de Ana)
INSERT INTO schedule (professional_id, patient_id, availability_id, status)
SELECT p.id, c.id, a.id, 'ACTIVE'
FROM users p, users c, availabilities a
WHERE p.email = 'ana.silva@email.com'
  AND c.email = 'joao.p@email.com'
  AND a.owner_id = p.id
ORDER BY a.start_time
LIMIT 1;

-- Lorenzo Pandolfo com Dr. Ana Silva (usa a segunda disponibilidade de Ana)
INSERT INTO schedule (professional_id, patient_id, availability_id, status)
SELECT p.id, c.id, a.id, 'ACTIVE'
FROM users p, users c, availabilities a
WHERE p.email = 'ana.silva@email.com'
  AND c.email = 'lorenzo.p@email.com'
ORDER BY a.start_time DESC
LIMIT 1;

-- Maria Oliveira com Dr. Carlos Souza (usa a primeira disponibilidade de Carlos)
INSERT INTO schedule (professional_id, patient_id, availability_id, status)
SELECT p.id, c.id, a.id, 'ACTIVE'
FROM users p, users c, availabilities a
WHERE p.email = 'carlos.souza@email.com'
  AND c.email = 'maria.o@email.com'
ORDER BY a.start_time
LIMIT 1;
