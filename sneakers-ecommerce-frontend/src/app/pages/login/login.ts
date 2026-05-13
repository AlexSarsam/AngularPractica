import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Iniciar sesión</h1>
        @if (mensajeError()) { <div class="alert-error">{{ mensajeError() }}</div> }
        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" placeholder="tu@email.com" />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" [(ngModel)]="contrasena" placeholder="••••••••" />
        </div>
        <button class="btn btn-primary" style="width:100%" (click)="iniciarSesion()">Iniciar sesión</button>
        <p class="auth-link">¿No tienes cuenta? <a routerLink="/register">Regístrate</a></p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private servicioAuth = inject(AuthService);
  private router       = inject(Router);

  email      = '';
  contrasena = '';
  mensajeError = signal('');

  iniciarSesion() {
    this.mensajeError.set('');
    this.servicioAuth.login({ email: this.email, password: this.contrasena }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error) => this.mensajeError.set(error.error?.error || 'Credenciales incorrectas')
    });
  }
}

