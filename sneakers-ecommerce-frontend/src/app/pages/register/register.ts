import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Crear cuenta</h1>
        @if (mensajeError())  { <div class="alert-error">{{ mensajeError() }}</div> }
        @if (mensajeExito())  { <div class="alert-success">{{ mensajeExito() }}</div> }
        <div class="form-group">
          <label>Nombre completo</label>
          <input type="text" [(ngModel)]="nombreCompleto" placeholder="Tu nombre" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" placeholder="tu@email.com" />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" [(ngModel)]="contrasena" placeholder="••••••••" />
        </div>
        <div class="form-group">
          <label>Confirmar contraseña</label>
          <input type="password" [(ngModel)]="confirmarContrasena" placeholder="••••••••" />
        </div>
        <button class="btn btn-primary" style="width:100%" (click)="registrarse()">Registrarse</button>
        <p class="auth-link">¿Ya tienes cuenta? <a routerLink="/login">Iniciar sesión</a></p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private servicioAuth = inject(AuthService);
  private router       = inject(Router);

  nombreCompleto    = '';
  email             = '';
  contrasena        = '';
  confirmarContrasena = '';
  mensajeError      = signal('');
  mensajeExito      = signal('');

  registrarse() {
    this.mensajeError.set('');
    if (this.contrasena !== this.confirmarContrasena) { this.mensajeError.set('Las contraseñas no coinciden'); return; }
    this.servicioAuth.register({ email: this.email, password: this.contrasena, full_name: this.nombreCompleto }).subscribe({
      next: () => {
        this.mensajeExito.set('Cuenta creada. Redirigiendo al login...');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => this.mensajeError.set(err.error?.error || 'Error al registrarse')
    });
  }
}
