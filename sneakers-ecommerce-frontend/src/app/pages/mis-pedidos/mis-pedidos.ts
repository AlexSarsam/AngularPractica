import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-mis-pedidos',
  imports: [DatePipe, DecimalPipe],
  template: `
    <div class="page">
      <h1 class="page-title">Mis Pedidos</h1>
      @if (listaPedidos().length === 0) {
        <div class="empty-state"><p style="font-size:4rem">📦</p><p>Todavía no has realizado ningún pedido</p></div>
      } @else {
        <div class="orders-list">
          @for (pedido of listaPedidos(); track pedido.id) {
            <div class="order-card">
              <div class="order-header" (click)="togglePedido(pedido.id)">
                <div class="order-meta">
                  <span class="order-id">Pedido #{{ pedido.id.slice(0, 8) }}...</span>
                  <span class="order-date">{{ pedido.created_at | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="order-right">
                  <span class="estado-badge" [class]="'estado-' + pedido.status">{{ etiquetaEstado(pedido.status) }}</span>
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
                        <span>{{ lineaPedido.products?.brand }}</span>
                        @if (lineaPedido.size) { <span>Talla: {{ lineaPedido.size }}</span> }
                        <span>x{{ lineaPedido.quantity }} — {{ lineaPedido.unit_price | number:'1.2-2' }}€/ud</span>
                      </div>
                    </div>
                  }
                  @if (pedido.shipping_address) { <p class="direccion">📍 {{ pedido.shipping_address }}</p> }
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class MisPedidosComponent implements OnInit {
  private servicioPedidos = inject(OrderService);

  listaPedidos    = signal<Order[]>([]);
  pedidoExpandido = signal<string | null>(null);

  ngOnInit() {
    this.servicioPedidos.getMyOrders().subscribe(pedidos => this.listaPedidos.set(pedidos));
  }

  togglePedido(idPedido: string) {
    this.pedidoExpandido.set(this.pedidoExpandido() === idPedido ? null : idPedido);
  }

  etiquetaEstado(estado: string): string {
    const traducciones: Record<string, string> = { pending:'Pendiente', confirmed:'Confirmado', shipped:'Enviado', delivered:'Entregado', cancelled:'Cancelado' };
    return traducciones[estado] ?? estado;
  }
}
