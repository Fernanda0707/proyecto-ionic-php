import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { personCircleOutline, logOutOutline, peopleOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Tab3Page implements OnInit {
  currentUser: any = null;

  constructor(private router: Router) {
    addIcons({ personCircleOutline, logOutOutline, peopleOutline, personOutline });
  }

  ngOnInit() {
    this.loadUser();
  }

  ionViewWillEnter() {
    this.loadUser();
  }

  loadUser() {
    const session = localStorage.getItem('user_session');
    if (session) {
      this.currentUser = JSON.parse(session);
    } else {
      this.currentUser = { name: 'Administrador', email: 'admin@example.com', role: 'admin' };
    }
  }

  logout() {
    localStorage.removeItem('user_session');
    this.router.navigate(['/login']);
  }
}