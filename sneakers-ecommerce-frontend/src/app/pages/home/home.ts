import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DecimalPipe],
  template: `
    <section class="hero">
      <h1>Las mejores zapatillas</h1>
      <p>Encuentra tu par perfecto entre las mejores marcas del mundo</p>
      <a routerLink="/catalogo" class="btn btn-primary">Ver catálogo</a>
    </section>
    <div class="page">
      <h2 class="page-title">Productos destacados</h2>
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
      <h2 class="page-title" style="margin-top:3rem">Categorías</h2>
      <div class="categories-grid">
        @for (categoria of listaCategorias(); track categoria.id) {
          <a routerLink="/catalogo" [queryParams]="{category: categoria.slug}" class="category-card">{{ categoria.name }}</a>
        }
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private servicioProductos = inject(ProductService);

  listaProductos  = signal<Product[]>([]);
  listaCategorias = signal<Category[]>([]); 

  ngOnInit() {
    this.servicioProductos.getProducts().subscribe(respuesta => this.listaProductos.set(respuesta.data.slice(0, 6)));
    this.servicioProductos.getCategories().subscribe(categorias => this.listaCategorias.set(categorias));
  }
}
