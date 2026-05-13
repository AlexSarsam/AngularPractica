import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models';

@Component({
  selector: 'app-catalogo',
  imports: [FormsModule, RouterLink, DecimalPipe],
  template: `
    <div class="page">
      <h1 class="page-title">Catálogo</h1>
      <div class="filters">
        <div class="search-box">
          <input type="text" [(ngModel)]="textoBusqueda" placeholder="Buscar producto..." (keyup.enter)="buscar()" />
          <button class="btn btn-primary" (click)="buscar()">Buscar</button>
        </div>
        <div class="category-filters">
          <button class="cat-btn" [class.active]="categoriaSeleccionada === ''" (click)="filtrarCategoria('')">Todos</button>
          @for (categoria of listaCategorias(); track categoria.id) {
            <button class="cat-btn" [class.active]="categoriaSeleccionada === categoria.slug" (click)="filtrarCategoria(categoria.slug)">{{ categoria.name }}</button>
          }
        </div>
      </div>
      @if (cargando()) {
        <p class="loading">Cargando...</p>
      } @else if (listaProductos().length === 0) {
        <div class="empty-state">No se encontraron productos</div>
      } @else {
        <div class="grid-products">
          @for (producto of listaProductos(); track producto.id) {
            <a routerLink="/catalogo/{{ producto.slug }}" class="product-card">
              @if (producto.image_url) {
                <img [src]="producto.image_url" [alt]="producto.name" />
              } @else {
                <div class="no-img">👟</div>
              }
              <div class="product-info">
                <h3>{{ producto.name }}</h3>
                <p class="brand">{{ producto.brand }}</p>
                <p class="price">{{ producto.price | number:'1.2-2' }}€</p>
              </div>
            </a>
          }
        </div>
        @if (totalPaginas > 1) {
          <div class="pagination">
            @for (pagina of Array(totalPaginas); track $index) {
              <button class="page-btn" [class.active]="paginaActual() === $index + 1" (click)="cambiarPagina($index + 1)">{{ $index + 1 }}</button>
            }
          </div>
        }
      }
    </div>
  `
})
export class CatalogoComponent implements OnInit {
  private servicioProductos = inject(ProductService);
  private route             = inject(ActivatedRoute);

  listaProductos     = signal<Product[]>([]);
  listaCategorias    = signal<Category[]>([]);
  totalResultados    = signal(0);
  paginaActual       = signal(1);
  textoBusqueda      = '';
  categoriaSeleccionada = '';
  cargando           = signal(false);

  ngOnInit() {
    this.servicioProductos.getCategories().subscribe(categorias => this.listaCategorias.set(categorias));
    this.route.queryParams.subscribe(params => {
      this.categoriaSeleccionada = params['category'] || '';
      this.textoBusqueda         = params['search']   || '';
      this.paginaActual.set(1);
      this.cargarProductos();
    });
  }

  cargarProductos() {
    this.cargando.set(true);
    this.servicioProductos.getProducts({
      category: this.categoriaSeleccionada || undefined,
      search:   this.textoBusqueda         || undefined,
      page:     this.paginaActual()
    }).subscribe(respuesta => {
      this.listaProductos.set(respuesta.data);
      this.totalResultados.set(respuesta.total);
      this.cargando.set(false);
    });
  }

  buscar() { this.paginaActual.set(1); this.cargarProductos(); }

  filtrarCategoria(slug: string) { this.categoriaSeleccionada = slug; this.paginaActual.set(1); this.cargarProductos(); }

  get totalPaginas() { return Math.ceil(this.totalResultados() / 12); }

  cambiarPagina(numeroPagina: number) { this.paginaActual.set(numeroPagina); this.cargarProductos(); }
}
