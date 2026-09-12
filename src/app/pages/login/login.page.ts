import { Component, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personCircleOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';
import axios from 'axios';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginPage {
  loading: boolean = false;
  private apiUrl = 'http://localhost:8000/login.php';

  constructor(
    private router: Router,
    private zone: NgZone,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({ personCircleOutline, mailOutline, lockClosedOutline });
  }

  async onLogin(emailVal: any, passwordVal: any) {
    const email = (emailVal ?? '').toString().trim();
    const password = (passwordVal ?? '').toString().trim();

    if (!email || !password) {
      this.showToast('Por favor completa todos los campos', 'warning');
      return;
    }

    const loader = await this.loadingController.create({
      message: 'Validando credenciales...',
      spinner: 'crescent'
    });
    await loader.present();
    this.loading = true;

    try {
      const response = await axios.post(
        this.apiUrl,
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      await loader.dismiss();
      this.loading = false;

      if (response.data && response.data.status === 'success') {
        localStorage.setItem('user_session', JSON.stringify(response.data.user));
        await this.showToast('Bienvenido, ' + response.data.user.name, 'success');

        // Redirección dentro de la zona de Angular
        this.zone.run(() => {
  this.router.navigateByUrl('/tab2');
});
      } else {
        this.showToast(response.data.message || 'Error en autenticación', 'danger');
      }
    } catch (error: any) {
      await loader.dismiss();
      this.loading = false;
      const msg = error.response?.data?.message || 'No se pudo conectar con el servidor';
      this.showToast(msg, 'danger');
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}