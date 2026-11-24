CREATE DATABASE IF NOT EXISTS nail_salon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nail_salon;
CREATE TABLE IF NOT EXISTS users (
 id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL,
 email VARCHAR(150) NOT NULL UNIQUE, phone VARCHAR(25) NOT NULL DEFAULT '',
 password VARCHAR(255) NOT NULL, role ENUM('client','admin') NOT NULL DEFAULT 'client',
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS services (
 id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL UNIQUE,
 description TEXT NOT NULL, duration_minutes INT NOT NULL, price DECIMAL(10,2) NOT NULL,
 is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS appointments (
 id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, service_id INT NOT NULL,
 start_at DATETIME NOT NULL, status ENUM('scheduled','cancelled','completed') NOT NULL DEFAULT 'scheduled',
 notes VARCHAR(500) NOT NULL DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (service_id) REFERENCES services(id),
 INDEX idx_schedule (start_at,status)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS auth_tokens (
 id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, token_hash CHAR(64) NOT NULL UNIQUE,
 expires_at DATETIME NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
 INDEX idx_expires (expires_at)
) ENGINE=InnoDB;
INSERT INTO services(name,description,duration_minutes,price) VALUES
('Manicure clásico','Limpieza, limado y esmaltado tradicional.',45,180.00),
('Gel semipermanente','Manicure y color duradero.',60,280.00),
('Uñas acrílicas','Extensión con acrílico, forma y acabado.',120,520.00),
('Nail art','Diseños decorativos personalizados.',90,390.00),
('Retiro de gel','Retiro cuidadoso y mantenimiento.',30,120.00)
ON DUPLICATE KEY UPDATE description=VALUES(description),duration_minutes=VALUES(duration_minutes),price=VALUES(price);
