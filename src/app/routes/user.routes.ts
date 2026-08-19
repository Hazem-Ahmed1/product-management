import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const userRoutes: Routes = [
  {
    path: 'products',
    loadComponent: () => import('../layout/user-layout/user-layout').then((m) => m.UserLayout),
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('../features/user/product-catalog/product-catalog').then((m) => m.ProductCatalog), title: 'Products | ShopAdmin' },
      { path: ':id', loadComponent: () => import('../features/user/product-details/product-details').then((m) => m.ProductDetails), title: 'Product details | ShopAdmin' },
    ],
  },
];
