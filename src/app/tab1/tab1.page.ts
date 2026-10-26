import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FotoService } from '../services/foto.service';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class Tab1Page {
  currentStep: number = 0;
  tituloFotoTemp: string = '';

  formData = {
    email: '',
    pass: '',
    cpass: '',
    twitter: '',
    facebook: '',
    gplus: '',
    fname: '',
    lname: '',
    phone: '',
    address: ''
  };

  steps: string[] = ['Account Setup', 'Social Profiles', 'Personal Details', 'Foto / Evidencia'];

  constructor(public fotoService: FotoService) {}

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fotoService.agregarFotoDesdeArchivo(file, this.tituloFotoTemp || 'Evidencia de registro');
      this.tituloFotoTemp = '';
      event.target.value = '';
    }
  }

  submitForm(): void {
    const payload = {
      ...this.formData,
      evidencias: this.fotoService.fotos
    };
    console.log('Datos y fotos listos para enviar:', payload);
    alert('¡Formulario y fotos guardados correctamente!');
  }
}