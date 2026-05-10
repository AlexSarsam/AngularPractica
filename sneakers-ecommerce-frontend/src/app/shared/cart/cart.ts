import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  imports: [FormsModule, DecimalPipe],
  template: `
    @if (cart.isOpen()) {
      <div class="overlay" (click)="cart.close()"></div>
      <div class="cart-panel">
        <div class="cart-header">
          <h2>Carrito</h2>
          <button (click)="cart.close()">✕</button>
        </div>
        @if (mensajeExito()) { <div class="alert-success">{{ mensajeExito() }}</div> }
        @if (cart.items().length === 0) {
          <div class="empty-state"><p>🛒</p><p>Tu carrito está vacío</p></div>
        } @else {
          <div class="cart-items">
            @for (item of cart.items(); track item.product.id + item.size) {
              <div class="cart-item">
                @if (item.product.image_url) {
                  <img [src]="item.product.image_url" [alt]="item.product.name" />
                } @else {
                  <div class="no-img">👟</div>
                }
                <div class="item-info">
                  <strong>{{ item.product.name }}</strong>
                  <span>{{ item.product.brand }}</span>
                  @if (item.size) { <span>Talla: {{ item.size }}</span> }
                  <span>x{{ item.quantity }} — {{ (item.product.price * item.quantity) | number:'1.2-2' }}€</span>
                </div>
                <button class="remove-btn" (click)="eliminarItem(item.product.id, item.size)">✕</button>
              </div>
            }
          </div>
          <div class="cart-total"><strong>Total: {{ cart.total() | number:'1.2-2' }}€</strong></div>
          @if (!mostrarCheckout()) {
            <button class="btn btn-primary" style="width:100%" (click)="finalizarPedido()">Finalizar Pedido</button>
          } @else {
            <div class="checkout-form">
              @if (mensajeError()) { <div class="alert-error">{{ mensajeError() }}</div> }
              <div class="form-group">
                <label>Dirección de envío *</label>
                <input [(ngModel)]="direccionEnvio" placeholder="Calle, número, ciudad..." />
              </div>
              <div class="form-group">
                <label>Observaciones</label>
                <textarea [(ngModel)]="observaciones" placeholder="Notas para la entrega..."></textarea>
              </div>
              <button class="btn btn-primary" style="width:100%" (click)="confirmarPedido()">Confirmar Pedido</button>
            </div>
          }
        }
      </div>
    }
  `
})
export class CartComponent {
  cart             = inject(CartService);
  private servicioPedidos = inject(OrderService);
  private auth     = inject(AuthService);
  private router   = inject(Router);

  mostrarCheckout = signal(false);
  direccionEnvio  = '';
  observaciones   = '';
  mensajeError    = signal('');
  mensajeExito    = signal('');

  eliminarItem(productoId: string, talla: string | null) {
    this.cart.removeItem(productoId, talla);
  }

  finalizarPedido() {
    if (!this.auth.isLoggedIn()) { this.cart.close(); this.router.navigate(['/login']); return; }
    this.mostrarCheckout.set(true);
  }

  confirmarPedido() {
    if (!this.direccionEnvio.trim()) { this.mensajeError.set('La dirección de envío es obligatoria'); return; }
    const datosPedido = {
      items: this.cart.items().map(item => ({ product_id: item.product.id, quantity: item.quantity, size: item.size })),
      shipping_address: this.direccionEnvio,
      notes: this.observaciones
    };
    this.servicioPedidos.createOrder(datosPedido).subscribe({
      next: () => {
        this.mensajeExito.set('¡Pedido realizado correctamente!');
        this.cart.clear();
        this.mostrarCheckout.set(false);
        this.direccionEnvio = '';
        this.observaciones  = '';
        this.mensajeError.set('');
        setTimeout(() => { this.cart.close(); this.mensajeExito.set(''); }, 2000);
      },
      error: (err) => this.mensajeError.set(err.error?.error || 'Error al crear el pedido')
    });
  }
}
