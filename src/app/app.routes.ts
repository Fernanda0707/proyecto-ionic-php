import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'tab2',
    loadComponent: () => import('./tab2/tab2.page').then(m => m.Tab2Page),
  },
  {
    path: 'tab3',
    loadComponent: () => import('./tab3/tab3.page').then(m => m.Tab3Page),
  },
  {
    path: 'tabs',
    redirectTo: 'tab2',
    pathMatch: 'full'
  }
];