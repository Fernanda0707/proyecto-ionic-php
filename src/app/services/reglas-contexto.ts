export interface ContextoAplicacion { tieneUbicacion: boolean; tieneRed: boolean; }
export interface DecisionContextual {
  regla: 'R1' | 'R2' | 'R3';
  titulo: string; descripcion: string; permiteMapas: boolean; mensaje: string;
}
/** Motor puro: la falta de ubicación tiene prioridad sobre la conectividad. */
export function evaluarContexto(c: ContextoAplicacion): DecisionContextual {
  if (!c.tieneUbicacion) return {
    regla: 'R3', titulo: 'Solicitar ubicación',
    descripcion: 'No hay coordenadas autorizadas; no se pueden personalizar mapas.',
    permiteMapas: false, mensaje: 'Pulsa Permitir y obtener mi ubicación.'
  };
  if (!c.tieneRed) return {
    regla: 'R2', titulo: 'Modo sin conexión',
    descripcion: 'Se conservan coordenadas pero se deshabilitan servicios de mapas.',
    permiteMapas: false, mensaje: 'Conéctate a una red para usar Google Maps.'
  };
  return {
    regla: 'R1', titulo: 'Búsqueda cercana disponible',
    descripcion: 'Hay coordenadas y el navegador detecta red: se habilitan los enlaces.',
    permiteMapas: true, mensaje: 'Puedes consultar el mapa y buscar salones cercanos.'
  };
}
