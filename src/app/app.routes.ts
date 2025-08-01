import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup.page').then((m) => m._SignupPage),
  },
  {
    path: '',
    redirectTo: 'signup',
    pathMatch: 'full',
  },
];
