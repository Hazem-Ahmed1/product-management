import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { authRoutes } from './routes/auth.routes';
import { adminRoutes } from './routes/admin.routes';
import { userRoutes } from './routes/user.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  ...authRoutes,
  ...adminRoutes,
  ...userRoutes,
  {
    path: 'not-found',
    loadComponent: () =>
      import('./features/not-found/not-found').then((m) => m.NotFound),
    title: '404 Not Found — ShopAdmin',
  },
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
