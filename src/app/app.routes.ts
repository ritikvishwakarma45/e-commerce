import { Routes } from '@angular/router';
import { AuthGuard } from './auth-guard';

export const routes: Routes = [
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup.page').then((m) => m._SignupPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    // canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.page').then((m) => m.AdminPage),
    // canActivate: [AuthGuard],
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./admin/products/products.page').then((m) => m.ProductsPage),
    // canActivate: [AuthGuard],
  },
  {
    path: 'admin/products/add',
    loadComponent: () => import('./admin/products/product-form/product-form.page').then((m) => m.ProductFormPage),
    // canActivate: [AuthGuard],
  },
  {
    path: 'admin/products/edit/:id',
    loadComponent: () => import('./admin/products/product-form/product-form.page').then((m) => m.ProductFormPage),
    // canActivate: [AuthGuard],
  },
  {
    path: 'admin/categories',
    loadComponent: () => import('./admin/categories/categories.page').then((m) => m.CategoriesPage),
    // canActivate: [AuthGuard],
  },
  {
    path: 'admin/items',
    loadComponent: () => import('./admin/items/items.page').then((m) => m.ItemsPage),
    // canActivate: [AuthGuard],
  },
  {
    path: 'admin/items/category/:categoryId',
    loadComponent: () => import('./admin/items/items.page').then((m) => m.ItemsPage),
    // canActivate: [AuthGuard],
  },
  {
    path: 'admin/items/add',
    loadComponent: () => import('./admin/items/item-form/item-form.page').then((m) => m.ItemFormPage),
    // canActivate: [AuthGuard],
  },
  {
    path: 'admin/items/edit/:id',
    loadComponent: () => import('./admin/items/item-form/item-form.page').then((m) => m.ItemFormPage),
    // canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full',
  },
];
