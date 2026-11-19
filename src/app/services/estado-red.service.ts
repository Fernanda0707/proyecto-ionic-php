import { Injectable, OnDestroy, signal } from '@angular/core';

/**
 * Capacidad física: conectividad de red.
 * Navigator.onLine indica la conexión estimada por el navegador,
 * NO garantiza acceso a Internet ni disponibilidad de la API.
 * Los eventos online/offline se escuchan en window.
 */
@Injectable({ providedIn: 'root' })
export class EstadoRedService implements OnDestroy {
  readonly conectado = signal<boolean>(navigator.onLine);
  readonly ultimaLectura = signal<Date>(new Date());
  readonly historial = signal<string[]>([]);

  private readonly conectadoHandler = () => this.actualizar('online');
  private readonly desconectadoHandler = () => this.actualizar('offline');

  constructor() {
    window.addEventListener('online', this.conectadoHandler);
    window.addEventListener('offline', this.desconectadoHandler);
  }

  actualizar(evento: 'online' | 'offline' | 'manual' = 'manual'): void {
    const nuevoEstado = navigator.onLine;
    this.conectado.set(nuevoEstado);
    const fecha = new Date();
    this.ultimaLectura.set(fecha);
    this.historial.update(actual => [
      fecha.toLocaleTimeString() + ' · ' + evento + ' · ' +
        (nuevoEstado ? 'Red disponible' : 'Red no disponible'),
      ...actual
    ].slice(0, 5));
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.conectadoHandler);
    window.removeEventListener('offline', this.desconectadoHandler);
  }
}
