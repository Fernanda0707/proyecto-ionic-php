import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonTextarea,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonImg
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cameraOutline, imageOutline, trashOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { FotoService } from '../services/foto.service';

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonTextarea,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonImg
  ]
})
export class Tab2Page {
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

  steps: string[] = ['Configuración', 'Redes Sociales', 'Datos Personales', 'Foto / Evidencia'];

  constructor(public fotoService: FotoService) {
    addIcons({ cameraOutline, imageOutline, trashOutline, checkmarkCircleOutline });
  }

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