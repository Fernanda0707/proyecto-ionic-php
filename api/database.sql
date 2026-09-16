-- Creación de la base de datos para el sistema de inventario
CREATE DATABASE IF NOT EXISTS catalog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE catalog_db;

-- Entidad 1: Cuentas y Operadores (accounts)
DROP TABLE IF EXISTS accounts;
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    account_email VARCHAR(150) NOT NULL UNIQUE,
    access_token VARCHAR(255) NOT NULL,
    access_level ENUM('manager', 'staff') DEFAULT 'staff',
    status TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Entidad 2: Artículos del Catálogo e Inventario (inventory_items)
DROP TABLE IF EXISTS inventory_items;
CREATE TABLE inventory_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    item_title VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL,
    stock_qty INT DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL,
    is_available TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;