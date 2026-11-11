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
  {
    path: 'account/profile',
    title: 'ÑanduGrid — Editar perfil',
    loadComponent: () =>
      import('./features/profile-edit/profile-edit.component').then((m) => m.ProfileEditComponent),
  },
  {
    path: 'marketplace',
    title: 'ÑanduGrid — Fotógrafos',
    loadComponent: () =>
      import('./features/marketplace/marketplace.component').then((m) => m.MarketplaceComponent),
  },
  {
    path: 'services',
    title: 'ÑanduGrid — Servicios',
    loadComponent: () =>
      import('./features/services/services.component').then((m) => m.ServicesComponent),
  },
  {
    path: 'bookings',
    title: 'ÑanduGrid — Reservas',
    loadComponent: () =>
      import('./features/bookings/bookings.component').then((m) => m.BookingsComponent),
  },
  {
    path: 'favorites',
    title: 'ÑanduGrid — Favoritos',
    loadComponent: () =>
      import('./features/favorites/favorites.component').then((m) => m.FavoritesComponent),
  },
  {
    path: 'messages',
    title: 'ÑanduGrid — Mensajes',
    loadComponent: () =>
      import('./features/messages/messages.component').then((m) => m.MessagesComponent),
  },
  { path: '**', redirectTo: '' },
];
