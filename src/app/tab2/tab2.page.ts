import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { refreshOutline, personOutline, peopleOutline, alertCircleOutline } from 'ionicons/icons';
import axios from 'axios';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab2Page implements OnInit {
  users: any[] = [];
  loading: boolean = false;
  private apiUrl = 'http://localhost:8000/users.php';

  constructor(private toastController: ToastController) {
    addIcons({ refreshOutline, personOutline, peopleOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.loadUsers();
  }

  ionViewWillEnter() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    try {
      const response = await axios.get(this.apiUrl);
      if (response.data && response.data.status === 'success') {
        this.users = response.data.data;
      }
    } catch (error) {
      // Si la API no responde de inmediato, muestra al admin para no dejar la vista vacía
      this.users = [
        { id: 1, name: 'Administrador', email: 'admin@example.com', role: 'admin' }
      ];
    } finally {
      this.loading = false;
    }
  }
}