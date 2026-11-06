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

## Versión 2.0: modo desconectado y sincronización
- Caché local (`localStorage`) del catálogo y las citas de la clienta, separada por id. Al fallar una lectura de red, la interfaz muestra la última copia y marca el estado offline.
- Edición de notas (PATCH): si falla **por falta de respuesta HTTP**, la nota se guarda en una cola local y se aplica visualmente a la copia caché. El botón **Sincronizar** reenvía esas notas una a una. Si el servidor responde 401/409/422, no se encola.
- **No se encolan nuevas reservas ni cancelaciones:** sus consecuencias de negocio requieren confirmación online. Sin conexión, mostrar el error y volver a intentar conscientemente.
- Multimedia: imágenes locales seleccionadas desde archivo/cámara con `FotoService`; son previsualizaciones de sesión y no se sincronizan ni persisten en servidor.
- La caché contiene datos personales de citas: para producción usar almacenamiento nativo cifrado, limpieza al cerrar sesión y política de retención. En navegadores compartidos borrar datos del sitio. No utilizar este prototipo para información sensible real.

## APK / demo
```powershell
npm run build
npx cap sync android
npx cap open android
```
En Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s), o `cd android; .\gradlew.bat assembleDebug`.
Resultado usual: `android/app/build/outputs/apk/debug/app-debug.apk`. **Solo se confirma al ejecutar la construcción en tu equipo.**
El APK actual usa `http://localhost:8000/nails.php`: en el dispositivo **localhost no es tu PC**, así que antes de una demo móvil debes exponer la API a una IP local accesible, ajustar CORS/red y la configuración de seguridad para desarrollo. Recomendado: demostrar la conectividad real en el navegador (Ionic serve) y mostrar APK solo si se verificó la conexión en móvil.

## Pruebas de evaluación
1. GET servicios con servidor activo, recargar y luego detener PHP: caché visible y aviso offline.
2. Entrar a Mis citas, detener PHP, editar **notas**: aparece cola pendiente; reiniciar PHP, pulsar Sincronizar, verificar MySQL y recargar.
3. Con PHP activo crear (POST), reprogramar (PUT), cambiar notas (PATCH), cancelar (DELETE) una cita.
4. Elegir imagen JPG/PNG menor de 2 MB; mostrar vista previa y eliminarla.
