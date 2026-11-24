# Nail Studio — Sensor / capacidad de red (Web APIs)

## Investigación (19 de noviembre de 2026)
**Capacidad elegida:** conectividad de red. Se eligió porque está disponible en navegadores móviles y puede demostrarse al habilitar/deshabilitar Wi-Fi o datos móviles, sin instalar nuevos complementos.

**Documentación consultada:** [MDN Navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine), [MDN evento online](https://developer.mozilla.org/en-US/docs/Web/API/Window/online_event), [MDN evento offline](https://developer.mozilla.org/en-US/docs/Web/API/Window/offline_event).

La propiedad `navigator.onLine` es una estimación de conectividad del navegador. Al cambiar se emiten eventos `online` u `offline` en `window`. **No garantiza Internet real ni conexión a la API PHP**. Para comprobar el backend hay que efectuar una solicitud HTTP y gestionar errores.

## Prompt utilizado para investigar la API
> Estoy desarrollando Nail Studio con Ionic 9, Angular 22, Capacitor 8 y PHP/MySQL. Investiga una capacidad física accesible en web y dispositivos móviles para cumplir una práctica de sensores. Compara brevemente GPS y estado de conectividad de red. Explica qué informan `navigator.onLine`, `window.addEventListener('online')` y `window.addEventListener('offline')`, qué permisos requieren, sus limitaciones y compatibilidad. Propón un servicio Angular con signals, limpieza de listeners, interfaz con datos observables y pasos de validación en teléfono, sin inventar lecturas.

## Solución implementada
- **Servicio:** `src/app/services/estado-red.service.ts`.
- **Pantalla:** `src/app/pages/salon/salon.page.html`, dentro de **Ubicación**, tarjeta «Sensor de conectividad de red».
- **Eventos:** `window.addEventListener('online', ...)` se emite cuando el navegador detecta red; `window.addEventListener('offline', ...)` cuando detecta desconexión. Cada evento actualiza las signals `conectado`, `ultimaLectura` e `historial`.
- **Datos visibles:** badge «Conectado a una red» / «Sin conexión de red», hora de lectura y hasta cinco eventos.
- **Permisos:** la lectura del estado de red no pide permiso específico al usuario, a diferencia del GPS.
- **Limpieza:** en `ngOnDestroy` se retiran los listeners.
- **Sin dependencias nuevas:** API estándar del navegador en el WebView de Capacitor.

## Validación posterior
### Qué se verificó
- Se revisó que las API citadas existen en documentación MDN.
- Se integraron listeners y visualización reactiva en el código fuente de la rama de Nail Studio.
- **Pendiente:** compilación en el equipo, prueba real con conexión y sin conexión, y video desde dispositivo. No se atribuyen resultados a pruebas que aún no se han ejecutado.

### Pruebas reproducibles
1. En un teléfono con la app ejecutándose, ir a **Ubicación** y enfocar «Sensor de conectividad de red».
2. Mostrar «Conectado a una red» y hora. Pulsar «Comprobar estado de red».
3. Activar modo avión y asegurarse de que Wi-Fi también quede apagado (algunos teléfonos conservan Wi-Fi con modo avión). Volver a la app.
4. Verificar «Sin conexión de red» y nuevo evento `offline`; si no se actualiza en el WebView, pulsar «Comprobar estado de red».
5. Volver a activar Wi-Fi/datos y verificar `online`.
6. Grabar la pantalla del dispositivo mostrando los estados, hora y eventos. Si se graba en el navegador de PC, aclarar que no sustituye la evidencia móvil exigida.

## Guion para video (45–60 s)
«Mi aplicación Nail Studio ahora lee la capacidad física de conectividad de red usando Web APIs. Consulto `navigator.onLine` para conocer el estado estimado de conexión del navegador y escucho los eventos `online` y `offline` para actualizar la pantalla automáticamente. Aquí muestro el indicador, la hora de lectura y el historial. Desactivo la red y observo el cambio; después la activo nuevamente. No se requiere permiso de ubicación para esta capacidad. El indicador no asegura disponibilidad de Internet ni de PHP, solo reporta el estado detectado por el dispositivo. La investigación y las pruebas están documentadas en GitHub».
