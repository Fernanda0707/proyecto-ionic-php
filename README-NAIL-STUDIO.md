# Nail Studio 💅
Módulo nuevo de citas para salón de uñas sobre Ionic Angular + Axios + PHP + MySQL.

## Levantar localmente
1. Requisitos: Node compatible con `package.json`, PHP 8.1+ con PDO MySQL, MySQL/MariaDB.
2. Importa `api/nail_salon.sql` en MySQL (phpMyAdmin o `mysql -u root -p < api/nail_salon.sql`).
3. Configura `DB_HOST`, `DB_NAME=nail_salon`, `DB_USER`, `DB_PASSWORD` en el entorno de PHP. Por defecto se usa 127.0.0.1/root sin contraseña (solo entorno local).
4. En una terminal: `php -S localhost:8000 -t api`.
5. En otra: `npm ci` y `npx ionic serve` o `npm start`. Ve a `/login`.
6. Registra una clienta, inicia sesión, consulta servicios, agenda, reprograma, cambia notas y cancela una cita.

**Importante:** `src/app/services/nail-api.service.ts` contiene `http://localhost:8000/nails.php`, solo válido para navegador local. En Android/iOS físicos debes usar una API accesible por red y HTTPS y actualizar el origen permitido de CORS. No conectar el móvil a localhost pensando que es el PC.

## Alcance
Registro/login, catálogo de servicios, perfil, listado y gestión de citas, errores y loaders. `DELETE` cancela lógicamente, no borra el historial. Solo se atiende una cita simultánea (una especialista); slots de 30 minutos, horario 09:00–19:00 según zona horaria del servidor PHP. La validación final siempre la hace el backend.

Documentación: [Arquitectura, métodos, endpoints, JSON y evidencia IA](docs/ARQUITECTURA_CITAS_UNAS.md).

## Seguridad y QA
Tokens por sesión guardados en sessionStorage (decisión de prototipo web; para móvil de producción usar almacenamiento seguro nativo). No usar el endpoint antiguo `api/users.php` para clientas: corresponde a la práctica previa y no protege roles. Revisar/retirar la API heredada antes de desplegar. No se ha comprobado compilación ni integración end-to-end en un entorno con PHP y MySQL reales.
