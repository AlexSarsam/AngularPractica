import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus } from '../../core/models';

@Component({
  selector: 'app-admin-pedidos',
  imports: [FormsModule, DatePipe, DecimalPipe],
  template: `
    <div class="page">
      <h1 class="page-title">Gestión de Pedidos</h1>
      @if (mensajeError()) { <div class="alert-error">{{ mensajeError() }}</div> }
      @if (mensajeExito()) { <div class="alert-success">{{ mensajeExito() }}</div> }
      @if (listaPedidos().length === 0) {
        <div class="empty-state">No hay pedidos todavía</div>
      } @else {
        <div class="orders-list">
          @for (pedido of listaPedidos(); track pedido.id) {
            <div class="order-card">
              <div class="order-header" (click)="togglePedido(pedido.id)">
                <div class="order-meta">
                  <span class="order-id">Pedido #{{ pedido.id.slice(0, 8) }}...</span>
                  <span class="order-date">{{ pedido.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                  <span class="order-user">Usuario: {{ pedido.user_id.slice(0, 8) }}...</span>
                </div>
                <div class="order-right">
                  <select [ngModel]="pedido.status" (ngModelChange)="cambiarEstado(pedido, $event)" (click)="$event.stopPropagation()" class="status-select">
                    @for (estado of estadosDisponibles; track estado) {
                      <option [value]="estado">{{ etiquetaEstado(estado) }}</option>
                    }
                  </select>
                  <span class="order-total">{{ pedido.total_amount | number:'1.2-2' }}€</span>
                  <span class="arrow">{{ pedidoExpandido() === pedido.id ? '▲' : '▼' }}</span>
                </div>
              </div>
              @if (pedidoExpandido() === pedido.id) {
                <div class="order-items">
                  @for (lineaPedido of pedido.order_items; track lineaPedido.id) {
                    <div class="order-item">
                      @if (lineaPedido.products?.image_url) { <img [src]="lineaPedido.products?.image_url" [alt]="lineaPedido.products?.name" /> }
                      @else { <div class="no-img">👟</div> }
                      <div class="item-info">
                        <strong>{{ lineaPedido.products?.name }}</strong>
                        @if (lineaPedido.size) { <span>Talla: {{ lineaPedido.size }}</span> }
                        <span>x{{ lineaPedido.quantity }} — {{ lineaPedido.unit_price | number:'1.2-2' }}€/ud</span>
                      </div>
                    </div>
                  }
                  @if (pedido.shipping_address) { <p class="shipping">📍 {{ pedido.shipping_address }}</p> }
                  @if (pedido.notes) { <p class="notes">📝 {{ pedido.notes }}</p> }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AdminPedidosComponent implements OnInit {
  private servicioPedidos = inject(OrderService);

  listaPedidos    = signal<Order[]>([]);
  pedidoExpandido = signal<string | null>(null);
  mensajeExito    = signal('');
  mensajeError    = signal('');

  estadosDisponibles: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  ngOnInit() {
    this.servicioPedidos.getAllOrders().subscribe(pedidos => this.listaPedidos.set(pedidos));
  }

  togglePedido(idPedido: string) {
    this.pedidoExpandido.set(this.pedidoExpandido() === idPedido ? null : idPedido);
  }

  etiquetaEstado(estado: string): string {
    const traducciones: Record<string, string> = { pending:'Pendiente', confirmed:'Confirmado', shipped:'Enviado', delivered:'Entregado', cancelled:'Cancelado' };
    return traducciones[estado] ?? estado;
  }

  cambiarEstado(pedido: Order, nuevoEstado: string) {
    this.servicioPedidos.updateStatus(pedido.id, nuevoEstado).subscribe({
      next: () => {
        this.listaPedidos.update(pedidos => pedidos.map(p => p.id === pedido.id ? { ...p, status: nuevoEstado as OrderStatus } : p));
        this.mensajeExito.set('Estado actualizado');
        setTimeout(() => this.mensajeExito.set(''), 2000);
      },
      error: (err) => this.mensajeError.set(err.error?.error || 'Error al actualizar')
    });
  }
}
