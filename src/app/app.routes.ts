import { Routes } from '@angular/router';
export const routes: Routes = [
 {path:'',redirectTo:'login',pathMatch:'full'},
 {path:'login',loadComponent:()=>import('./pages/login/login.page').then(m=>m.LoginPage)},
 {path:'salon',loadComponent:()=>import('./pages/salon/salon.page').then(m=>m.SalonPage)},
 {path:'**',redirectTo:'login'}
];