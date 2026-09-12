CREATE DATABASE IF NOT EXISTS app_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE app_database;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Carga inicial con usuario administrador (Contraseña: Admin123!)
INSERT INTO users (name, email, password, role, is_active)
VALUES (
    'Administrador',
    'admin@example.com',
    '$2y$10$e0MYzXyjpJS7Pd0RVvHwHeFjN.7rPrvJvK46dqbQzqJnW6Iq5xM2i',
    'admin',
    1
) ON DUPLICATE KEY UPDATE id=id;