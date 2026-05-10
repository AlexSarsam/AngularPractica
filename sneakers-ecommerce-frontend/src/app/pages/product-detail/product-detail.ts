import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="page">
      <a routerLink="/catalogo" class="back-link">← Volver al catálogo</a>
      @if (mensajeError() && !producto()) { <div class="alert-error">{{ mensajeError() }}</div> }
      @if (producto(); as p) {
        <div class="detail-layout">
          <div class="detail-image">
            @if (p.image_url) { <img [src]="p.image_url" [alt]="p.name" /> }
            @else { <div class="no-img">👟</div> }
          </div>
          <div class="detail-info">
            <p class="brand">{{ p.brand }}</p>
            <h1>{{ p.name }}</h1>
            <p class="precio">{{ p.price | number:'1.2-2' }}€</p>
            <p class="categoria">Categoría: {{ p.categories?.name }}</p>
            @if (p.description) { <p class="descripcion">{{ p.description }}</p> }
            <p class="stock">Stock: {{ p.stock }} unidades</p>
            @if (p.sizes.length > 0) {
              <div>
                <p class="tallas-label">Talla:</p>
                <div class="tallas-grid">
                  @for (talla of p.sizes; track talla) {
                    <button class="talla-btn" [class.seleccionada]="tallaSeleccionada() === talla" (click)="tallaSeleccionada.set(talla)">{{ talla }}</button>
                  }
                </div>
              </div>
            }
            <div class="cantidad-row">
              <label>Cantidad:</label>
              <div class="cantidad-control">
                <button (click)="cantidad.set(cantidad() > 1 ? cantidad() - 1 : 1)">−</button>
                <span>{{ cantidad() }}</span>
                <button (click)="cantidad.set(cantidad() + 1)">+</button>
              </div>
            </div>
            @if (mensajeError()) { <div class="alert-error">{{ mensajeError() }}</div> }
            @if (anadido())      { <div class="alert-success">¡Añadido al carrito!</div> }
            @if (!auth.isAdmin()) {
              <button class="btn btn-primary btn-anadir" (click)="anadirAlCarrito()">Añadir al carrito</button>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private ruta             = inject(ActivatedRoute);
  private servicioProductos = inject(ProductService);
  cart = inject(CartService);
  auth = inject(AuthService);

  producto         = signal<Product | null>(null);
  tallaSeleccionada = signal<string | null>(null);
  cantidad         = signal(1);
  anadido          = signal(false);
  mensajeError     = signal('');

  ngOnInit() {
    const slug = this.ruta.snapshot.paramMap.get('slug')!;
    this.servicioProductos.getProductBySlug(slug).subscribe({
      next: p => this.producto.set(p),
      error: () => this.mensajeError.set('Producto no encontrado')
    });
  }

  anadirAlCarrito() {
    const p = this.producto();
    if (!p) return;
    if (p.sizes.length > 0 && !this.tallaSeleccionada()) { this.mensajeError.set('Selecciona una talla'); return; }
    this.mensajeError.set('');
    for (let i = 0; i < this.cantidad(); i++) { this.cart.addItem(p, this.tallaSeleccionada()); }
    this.anadido.set(true);
    setTimeout(() => this.anadido.set(false), 2000);
  }
}
