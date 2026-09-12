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
  IonButton
} from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
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
    IonButton
  ]
})
export class Tab1Page {
  currentStep: number = 0;

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

  steps: string[] = ['Account Setup', 'Social Profiles', 'Personal Details'];

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

  submitForm(): void {
    console.log('Datos enviados:', this.formData);
  }
}