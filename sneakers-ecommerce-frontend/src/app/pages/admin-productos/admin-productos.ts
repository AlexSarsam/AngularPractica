    import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Product, Category } from '../../core/models';

@Component({
  selector: 'app-admin-productos',
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">Gestión de Productos</h1>
        <button class="btn btn-primary" (click)="abrirCrear()">+ Nuevo producto</button>
      </div>
      @if (mensajeError())  { <div class="alert-error">{{ mensajeError() }}</div> }
      @if (mostrarFormulario()) {
        <div class="form-card">
          <h2>{{ idEditando() ? 'Editar producto' : 'Nuevo producto' }}</h2>
          <div class="form-grid">
            <div class="form-group"><label>Nombre *</label><input [(ngModel)]="formulario.name" placeholder="Nombre del producto" /></div>
            <div class="form-group"><label>Marca</label><input [(ngModel)]="formulario.brand" placeholder="Nike, Adidas..." /></div>
            <div class="form-group">
              <label>Categoría *</label>
              <select [(ngModel)]="formulario.category_id"> 
                <option value="">Selecciona categoría</option>
                @for (categoria of listaCategorias(); track categoria.id) {
                  <option [value]="categoria.id">{{ categoria.name }}</option>
                }
              </select>
            </div>
            <div class="form-group"><label>Precio (€) *</label><input type="number" [(ngModel)]="formulario.price" placeholder="99.99" /></div>
            <div class="form-group"><label>Stock</label><input type="number" [(ngModel)]="formulario.stock" placeholder="0" /></div>
            <div class="form-group"><label>Tallas (separadas por comas)</label><input [(ngModel)]="formulario.sizes" placeholder="38, 39, 40, 41, 42" /></div>
            <div class="form-group full"><label>Descripción</label><textarea [(ngModel)]="formulario.description" placeholder="Descripción del producto..."></textarea></div>
            <div class="form-group full"><label>Imagen</label><input type="file" accept="image/*" (change)="alCambiarImagen($event)" /></div>
          </div>
          <div class="form-actions">
            <button class="btn btn-secondary" (click)="mostrarFormulario.set(false)">Cancelar</button>
            <button class="btn btn-primary" (click)="guardar()">Guardar</button>
          </div>
        </div>
      }
      <div class="tabla-productos">
        <table>
          <thead><tr><th>Imagen</th><th>Nombre</th><th>Marca</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
          <tbody>
            @for (producto of listaProductos(); track producto.id) {
              <tr>
                <td>
                  @if (producto.image_url) { <img [src]="producto.image_url" [alt]="producto.name" class="miniatura" /> }
                  @else { <div class="sin-imagen">👟</div> }
                </td>
                <td>{{ producto.name }}</td>
                <td>{{ producto.brand }}</td>
                <td>{{ producto.price | number:'1.2-2' }}€</td>
                <td>{{ producto.stock }}</td>
                <td class="acciones">
                  <button class="btn btn-secondary" (click)="abrirEditar(producto)">Editar</button>
                  <button class="btn btn-danger" (click)="eliminar(producto)">Eliminar</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdminProductosComponent implements OnInit {
  private servicioProductos = inject(ProductService);

  listaProductos    = signal<Product[]>([]);
  listaCategorias   = signal<Category[]>([]);
  mostrarFormulario = signal(false);
  idEditando        = signal<string | null>(null);
  mensajeError      = signal('');

  formulario = { name: '', brand: '', category_id: '', price: '', stock: '', sizes: '', description: '', image: null as File | null };

  ngOnInit() { 
    this.cargarProductos();
    this.servicioProductos.getCategories().subscribe(categorias => this.listaCategorias.set(categorias));
  }

  cargarProductos() {
    this.servicioProductos.getProducts({ page: 1 }).subscribe(respuesta => this.listaProductos.set(respuesta.data));
  }

  abrirCrear() {
    this.idEditando.set(null);
    this.formulario = { name: '', brand: '', category_id: '', price: '', stock: '', sizes: '', description: '', image: null };
    this.mostrarFormulario.set(true);
    this.mensajeError.set('');
  }

  abrirEditar(producto: Product) {
    this.idEditando.set(producto.id);
    this.formulario = { name: producto.name, brand: producto.brand ?? '', category_id: producto.category_id, price: String(producto.price), stock: String(producto.stock), sizes: producto.sizes.join(', '), description: producto.description ?? '', image: null };
    this.mostrarFormulario.set(true);
    this.mensajeError.set('');
  }

  alCambiarImagen(evento: Event) {
    const inputArchivo = evento.target as HTMLInputElement;
    if (inputArchivo.files?.length) this.formulario.image = inputArchivo.files[0];
  }

  construirFormData(): FormData {
    const datosFormulario = new FormData();
    datosFormulario.append('name', this.formulario.name);
    datosFormulario.append('brand', this.formulario.brand);
    datosFormulario.append('category_id', this.formulario.category_id);
    datosFormulario.append('price', this.formulario.price);
    datosFormulario.append('stock', this.formulario.stock);
    datosFormulario.append('description', this.formulario.description);
    datosFormulario.append('sizes', JSON.stringify(this.formulario.sizes.split(',').map(talla => talla.trim()).filter(Boolean)));
    if (this.formulario.image) datosFormulario.append('image', this.formulario.image);
    return datosFormulario;
  }

  guardar() {
    this.mensajeError.set('');
    const datosFormulario = this.construirFormData(); 
    const idProducto = this.idEditando(); 
    const peticion = idProducto ? this.servicioProductos.updateProduct(idProducto, datosFormulario) : this.servicioProductos.createProduct(datosFormulario);
    peticion.subscribe({ 
      next: () => { this.mostrarFormulario.set(false); this.cargarProductos(); },
      error: (error) => this.mensajeError.set(error.error?.error || 'Error al guardar')
    });
  }

  eliminar(producto: Product) {
    if (!confirm(`¿Eliminar "${producto.name}"? Esta acción es permanente.`)) return;
    this.servicioProductos.deleteProduct(producto.id).subscribe({
      next: () => this.cargarProductos(),
      error: (error) => this.mensajeError.set(error.error?.error || 'Error al eliminar')
    });
  }
}




