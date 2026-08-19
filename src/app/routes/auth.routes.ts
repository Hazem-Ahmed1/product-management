import { Routes } from '@angular/router';
import { publicGuard } from '../core/guards/auth.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('../features/auth/login/login').then((m) => m.Login),
    canActivate: [publicGuard],
    title: 'Sign In — ShopAdmin',
  },
];
