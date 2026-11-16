import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface UbicacionActual {
  latitud: number;
  longitud: number;
  precisionMetros: number;
  fecha: Date;
}

/**
 * Ubicación puntual, iniciada explícitamente por la persona usuaria.
 * No utiliza watchPosition, no almacena coordenadas y no las manda a la API.
 */
@Injectable({ providedIn: 'root' })
export class UbicacionService {
  async obtenerUbicacion(): Promise<UbicacionActual> {
    if (!Capacitor.isNativePlatform() && !window.isSecureContext) {
      throw new Error('La ubicación web requiere HTTPS o localhost. Abre la aplicación desde un origen seguro.');
    }

    if (Capacitor.isNativePlatform()) {
      // requestPermissions no está implementado para web; allí el navegador pregunta al llamar getCurrentPosition.
      const permiso = await Geolocation.requestPermissions({ permissions: ['location'] });
      if (permiso.location !== 'granted' && permiso.coarseLocation !== 'granted') {
        throw new Error('Permiso de ubicación rechazado. Puedes habilitarlo en los ajustes de la aplicación.');
      }
    }

    const resultado = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });

    return {
      latitud: resultado.coords.latitude,
      longitud: resultado.coords.longitude,
      precisionMetros: resultado.coords.accuracy,
      fecha: new Date(resultado.timestamp)
    };
  }

  mensajeError(error: unknown): string {
    const codigo = String((error as { code?: string | number } | null)?.code ?? '');
    const mensaje = error instanceof Error ? error.message : String(error);
    if (codigo === '1' || codigo === 'OS-PLUG-GLOC-0003' || /denied|rechazado|permission/i.test(mensaje)) {
      return 'No se concedió permiso de ubicación. Autorízalo en el navegador o en Ajustes del teléfono y vuelve a intentar.';
    }
    if (codigo === '2' || codigo === 'OS-PLUG-GLOC-0007' || codigo === 'OS-PLUG-GLOC-0017' || /disabled|apagada|unavailable/i.test(mensaje)) {
      return 'No se pudo determinar tu ubicación. Activa la ubicación/GPS del dispositivo e intenta nuevamente.';
    }
    if (codigo === '3' || codigo === 'OS-PLUG-GLOC-0010' || /timeout|time out/i.test(mensaje)) {
      return 'Se agotó el tiempo de espera. Activa el GPS, mejora la señal y vuelve a intentar.';
    }
    return mensaje || 'Ocurrió un error al consultar la ubicación.';
  }

  enlaceMapa(posicion: UbicacionActual): string {
    return 'https://www.google.com/maps/search/?api=1&query='
      + posicion.latitud + '%2C' + posicion.longitud;
  }

  enlaceSalonesCercanos(posicion: UbicacionActual): string {
    const lat = posicion.latitud.toFixed(6);
    const lon = posicion.longitud.toFixed(6);
    return 'https://www.google.com/maps/search/salones+de+u%C3%B1as/@' + lat + ',' + lon + ',14z';
  }
}
