import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./app').then((m) => m.App),
  },
  {
    path: 'collections/:id',
    loadComponent: () => import('./pages/collection/collection').then((m) => m.Collection),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
