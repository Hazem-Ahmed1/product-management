import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { unsavedChangesGuard } from '../core/guards/unsaved-changes.guard';

/**
 * Admin routes — all protected by authGuard.
 * Loaded inside the AdminLayout shell (router-outlet).
 * All views here are admin-only (not for regular users).
 */
export const adminRoutes: Routes = [
  {
    path: 'admin',
    loadComponent: () =>
      import('../layout/admin-layout/admin-layout').then((m) => m.AdminLayout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('../features/admin/products/products').then((m) => m.Products),
        title: 'Products — ShopAdmin',
      },
      {
        path: 'products/create',
        loadComponent: () =>
          import('../features/admin/product-create/product-create').then(
            (m) => m.ProductCreate,
          ),
        title: 'Create Product — ShopAdmin',
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('../features/admin/product-edit/product-edit').then(
            (m) => m.ProductEdit,
          ),
        title: 'Edit Product — ShopAdmin',
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('../features/admin/product-details/admin-product-details').then(
            (m) => m.AdminProductDetails,
          ),
        title: 'Product Details — ShopAdmin',
      },
    ],
  },
];
