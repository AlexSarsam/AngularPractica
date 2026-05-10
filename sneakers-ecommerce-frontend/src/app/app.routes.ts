import { inject } from '@angular/core';
import { Routes, Router, CanActivateFn } from '@angular/router';
import { AuthService } from './core/services/auth.service';

const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAdmin() ? true : router.createUrlTree(['/']);
};

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
  { path: 'catalogo', loadComponent: () => import('./pages/catalogo/catalogo').then(m => m.CatalogoComponent) },
  { path: 'catalogo/:slug', loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetailComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent) },
  { path: 'mis-pedidos', canActivate: [authGuard], loadComponent: () => import('./pages/mis-pedidos/mis-pedidos').then(m => m.MisPedidosComponent) },
  { path: 'admin/productos', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/admin-productos/admin-productos').then(m => m.AdminProductosComponent) },
  { path: 'admin/pedidos', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/admin-pedidos/admin-pedidos').then(m => m.AdminPedidosComponent) },
  { path: '**', redirectTo: '' }
];
