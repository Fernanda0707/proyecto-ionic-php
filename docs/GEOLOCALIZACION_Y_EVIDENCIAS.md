# Nail Studio — Geolocalización real y evidencia

## Objetivo
Consultar la ubicación **actual** del dispositivo bajo acción expresa de la clienta, visualizar latitud y longitud, y permitir búsquedas de salones de uñas cercanos en Google Maps.

## Implementación
- Servicio: `src/app/services/ubicacion.service.ts`.
- Pantalla: `src/app/pages/salon/salon.page.ts` y `.html`, pestaña **Ubicación**.
- Plugin oficial: `@capacitor/geolocation` versión compatible con Capacitor 8.
- Android: `android/app/src/main/AndroidManifest.xml` con permisos `ACCESS_COARSE_LOCATION` y `ACCESS_FINE_LOCATION`.
- El permiso se pide únicamente después de pulsar «Permitir y obtener mi ubicación». En el navegador, `getCurrentPosition` solicita consentimiento. En Android, `requestPermissions` solicita el permiso antes de obtener la posición.
- Salida: seis decimales de latitud/longitud, precisión aproximada en metros y fecha. No se usan coordenadas de ejemplo.
- Función de ubicación: enlaces a «Ver mi posición» y «Buscar salones de uñas cercanos». Maps se abre al pulsarlo; las coordenadas se comparten con ese proveedor solo en ese momento.
- Privacidad: no hay `watchPosition`, no se almacenan coordenadas en `localStorage` ni se envían a PHP.

## Instalar y ejecutar después de actualizar la rama
```powershell
cd D:\Proyectos\NailStudioNuevo
git pull origin feat/nail-salon-booking
npm install
npm run build
npx ionic serve
```
Para Android (SDK y Gradle necesarios):
```powershell
npx cap sync android
# Compilar y ejecutar desde Android Studio o gradlew
```
Si la instalación de npm genera cambios en `package-lock.json`, subirlos al repositorio con un commit para que la próxima instalación con `npm ci` sea reproducible.

## Pruebas en dispositivo (guardar capturas/video)
1. Abre **Ubicación** y graba la explicación previa al permiso.
2. Pulsa «Permitir y obtener mi ubicación» y captura el diálogo real del sistema; selecciona «Mientras se usa la app».
3. Comprueba que aparecen latitud/longitud **reales**, precisión y fecha. Evita publicar coordenadas exactas de tu casa: difumínalas o realiza la prueba en un lugar público.
4. Pulsa «Ver mi posición en Google Maps» y, si deseas, «Buscar salones de uñas cercanos».
5. En ajustes de la aplicación, rechaza el permiso o desactiva GPS. Vuelve a pulsar el botón y captura el mensaje de error, sin bloqueo.
6. Rehabilita GPS y permiso, prueba de nuevo para mostrar recuperación.

## Explicación breve de defensa
«Solicito geolocalización únicamente por decisión de la clienta. El servicio Capacitor llama a `requestPermissions` en Android y a `getCurrentPosition` para recibir coordenadas con precisión y marca de tiempo. Las presento en Ionic y construyo enlaces a Google Maps. Si la usuaria rechaza el permiso, apaga GPS o hay timeout, explico el error. No hago seguimiento continuo ni guardo la posición en la base de datos».

## Lista de entrega
- [x] Código de solicitud de permiso y captura de coordenadas
- [x] UI para visualizar ubicación y consultar Maps
- [x] Tratamiento de errores y permisos rechazados
- [ ] Instalación local y compilación con dependencias
- [ ] Prueba en dispositivo físico / emulador Android
- [ ] Captura o video genuino desde dispositivo (no incluido en el repositorio hasta que lo grabes)
