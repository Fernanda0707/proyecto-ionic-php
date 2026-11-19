# Nail Studio 2.0 — Bitácora de IA y guion de defensa

## Evidencia del proceso
**Asistente:** ChatGPT. **Repositorio:** Fernanda0707/proyecto-ionic-php. **Rama:** feat/nail-salon-booking.
| Actividad | Análisis asistido por IA | Resultado / verificación |
|---|---|---|
| Arquitectura | Separar Ionic Angular, servicio Axios, API PHP y MySQL | Diagrama y contrato en ARQUITECTURA_CITAS_UNAS.md |
| Seguridad | Detectar login falso por error de red | Eliminado, backend valida credenciales y token |
| CRUD | Proponer GET, POST, PUT, PATCH y DELETE | Endpoints nails.php y consumo desde NailApiService |
| Integración | Analizar errores de imports Ionic 9 y CORS puerto 8101 | Usuario confirmó build y catálogo en navegador |
| Datos locales | Lecturas con caché, cambios de notas diferidos | Código añadido; requiere prueba offline en equipo |
| Multimedia | Incorporar FotoService a catálogo de Nail Studio | Selección y previsualización local; no se sube |
| APK | Documentar Capacitor Android y límites de localhost | Comandos de compilación; APK pendiente de generarse |

## Defensa oral breve (explicación verificable)
- **¿Qué es cliente-servidor?** Ionic/Angular presenta pantallas y valida formularios; PHP recibe peticiones HTTP, aplica reglas de negocio y usa PDO preparado para MySQL. Regresa JSON.
- **¿Dónde está la API?** `api/nails.php` y `api/config.php`; contratos en `docs/ARQUITECTURA_CITAS_UNAS.md`.
- **¿Dónde está el CRUD remoto?** `src/app/services/nail-api.service.ts`, invocado desde `src/app/pages/salon/salon.page.ts`.
- **¿Qué guarda localmente?** Catálogo y última lista de citas en `localStorage`. Las notas que no pudieron enviarse por pérdida de conectividad se encolan por cuenta y pueden sincronizarse manualmente.
- **¿Qué pasa sin Internet?** Los GET presentan copia cacheada y aviso; reservas nuevas, cambios de horario y cancelaciones requieren conexión. PATCH de notas puede encolarse sin asegurar confirmación del servidor.
- **¿Qué se sincroniza?** Solo notas pendientes; servidor sigue siendo la fuente de verdad. Puede haber conflictos y la funcionalidad de sincronización es una demostración simplificada.
- **¿Dónde está el multimedia?** `FotoService`, usado por `SalonPage` para fotos locales; no simular subida remota.
- **¿Cómo demostrar errores?** Detener servidor PHP, consultar catálogo/citas, editar notas, reanudar servidor y sincronizar.
- **¿Qué falta para producción?** HTTPS, autenticación segura para móvil, control de roles, pruebas de concurrencia, almacenamiento cifrado y endpoint accesible desde Android.

## Secuencia de la demostración
1. Explicar diagrama, endpoints y tablas.
2. Registrar y autenticar clienta.
3. GET catálogo y POST cita.
4. GET citas, PUT horario, PATCH notas y DELETE cancelación.
5. Foto local de inspiración y botón eliminar.
6. Detener PHP; mostrar caché, nota pendiente y recuperar conexión con Sincronizar.
7. Mostrar consola de build y el repositorio/PR.
8. Si Android SDK está instalado, enseñar APK debug; nunca afirmar prueba de Android solo por generar el archivo.

## Checklist honesta
- [x] Arquitectura propuesta / endpoints documentados
- [x] CRUD implementado en código; usuario reportó funcionamiento de alta/lectura
- [x] Compilación Ionic reportada antes del módulo 2.0
- [ ] Recompilar cambios 2.0 y verificar multimedia y modo offline
- [ ] Generar/instalar APK Android y probar conexión en dispositivo
- [ ] Validar PUT, PATCH, DELETE y reglas de conflicto en el equipo
