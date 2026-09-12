# Aplicación Móvil Híbrida - Ionic Angular + API PHP

## 1. Objetivo de la Aplicación
Desarrollar una aplicación móvil multiplataforma utilizando Ionic Framework y Angular (Standalone Components), implementando un flujo de autenticación de usuarios y consumo de servicios web mediante peticiones asíncronas con Axios hacia un backend en PHP con persistencia en MySQL.

## 2. Vistas Implementadas
* **Login (`/login`):** Formulario de autenticación con validación reactiva y manejo de sesiones en `localStorage`.
* **Usuarios (`/tab2`):** Listado dinámico de registros que consume el endpoint `GET` de `api/users.php`.
* **Perfil (`/tab3`):** Visualización de datos de sesión activa y opción de cierre de sesión.

## 3. Modelo de Datos (MySQL)
Tabla `users`:
* `id` (INT, PK, Auto Increment)
* `name` (VARCHAR 100)
* `email` (VARCHAR 150, UNIQUE)
* `password` (VARCHAR 255, HASH BCRYPT)
* `role` (ENUM: 'admin', 'user')
* `is_active` (TINYINT 1)
* `created_at` / `updated_at` (TIMESTAMP)

## 4. Ejecución del Proyecto
1. **Base de datos:** Importar `api/database.sql` en MySQL.
2. **Backend:** Iniciar servidor PHP en puerto 8000:
   ```bash
   php -S localhost:8000 -t api