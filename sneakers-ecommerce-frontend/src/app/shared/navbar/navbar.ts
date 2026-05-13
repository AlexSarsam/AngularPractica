import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <a routerLink="/" class="logo">KICK<span>store</span></a>
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Inicio</a>
        <a routerLink="/catalogo" routerLinkActive="active">Catálogo</a>
        @if (auth.isAdmin()) {
          <a routerLink="/admin/productos" routerLinkActive="active">Admin Productos</a>
          <a routerLink="/admin/pedidos" routerLinkActive="active">Admin Pedidos</a>
        }
        @if (auth.currentUser() && !auth.isAdmin()) {
          <a routerLink="/mis-pedidos" routerLinkActive="active">Mis Pedidos</a>
        }
      </div>
      <div class="nav-actions">
        @if (!auth.isAdmin()) {
          <button class="cart-btn" (click)="toggleCart()">
            🛒
            @if (cart.itemCount() > 0) {
              <span class="badge">{{ cart.itemCount() }}</span>
            }
          </button>
        }
        @if (auth.currentUser()) {
          <span class="username">{{ auth.currentUser()?.full_name }}</span>
          <button class="btn btn-secondary" (click)="logout()">Salir</button>
        } @else {
          <a routerLink="/login" class="btn btn-primary">Iniciar Sesión</a>
        }
      </div>
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  toggleCart() {
    this.cart.isOpen() ? this.cart.close() : this.cart.open();
  }
}
