import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'ÑanduGrid — Feed',
    loadComponent: () => import('./features/feed/feed.component').then((m) => m.FeedComponent),
  },
  {
    path: 'upload',
    title: 'ÑanduGrid — Subir foto',
    loadComponent: () => import('./features/upload/upload.component').then((m) => m.UploadComponent),
  },
  {
    path: 'u/:username',
    title: 'ÑanduGrid — Portafolio',
    loadComponent: () =>
      import('./features/portfolio/portfolio.component').then((m) => m.PortfolioComponent),
  },
  {
    path: 'dashboard',
    title: 'ÑanduGrid — Panel',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  { path: '**', redirectTo: '' },
];
