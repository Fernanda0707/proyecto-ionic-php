import { Injectable } from '@angular/core';

export interface FotoItem {
  filepath: string;
  webviewPath: string;
  titulo: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class FotoService {
  public fotos: FotoItem[] = [];

  constructor() {}

  /**
   * Carga una foto desde un archivo seleccionado por el usuario (Cámara o Galería)
   */
  public async agregarFotoDesdeArchivo(file: File, titulo: string = 'Nueva Captura'): Promise<void> {
    const reader = new FileReader();

    reader.onload = () => {
      const base64Image = reader.result as string;
      this.fotos.unshift({
        filepath: file.name,
        webviewPath: base64Image,
        titulo: titulo || file.name,
        fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    };

    reader.readAsDataURL(file);
  }

  /**
   * Elimina una foto de la lista
   */
  public eliminarFoto(index: number): void {
    this.fotos.splice(index, 1);
  }
}