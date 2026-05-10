import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>([]);
  isOpen = signal(false);

  total = computed(() =>
    this.items().reduce((acumulado, item) => acumulado + item.product.price * item.quantity, 0)
  );

  itemCount = computed(() =>
    this.items().reduce((acumulado, item) => acumulado + item.quantity, 0)
  );

  addItem(producto: Product, talla: string | null = null) {
    const itemExistente = this.items().find(item => item.product.id === producto.id && item.size === talla);
    if (itemExistente) {
      this.items.update(listaItems =>
        listaItems.map(item => item.product.id === producto.id && item.size === talla ? { ...item, quantity: item.quantity + 1 } : item)
      );
    } else {
      this.items.update(listaItems => [...listaItems, { product: producto, quantity: 1, size: talla }]);
    }
  }

  removeItem(productoId: string, talla: string | null) {
    this.items.update(listaItems => listaItems.filter(item => !(item.product.id === productoId && item.size === talla)));
  }

  clear() { this.items.set([]); }
  open()  { this.isOpen.set(true); }
  close() { this.isOpen.set(false); }
}
