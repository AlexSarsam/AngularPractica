import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product, Category } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api           = `${environment.apiUrl}/products`;
  private apiCategorias = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getProducts(filters: { category?: string; search?: string; page?: number } = {}) {
    let params = new HttpParams();
    if (filters.category) params = params.set('category', filters.category);
    if (filters.search)   params = params.set('search', filters.search);
    if (filters.page)     params = params.set('page', filters.page);
    return this.http.get<{ data: Product[]; total: number; page: number; limit: number }>(this.api, { params });
  }

  getCategories() {
    return this.http.get<Category[]>(this.apiCategorias);
  }

  getProductBySlug(slug: string) {
    return this.http.get<Product>(`${this.api}/${slug}`);
  }

  createProduct(formData: FormData) {
    return this.http.post<Product>(this.api, formData); 
  }

  updateProduct(id: string, formData: FormData) {  
    return this.http.put<Product>(`${this.api}/${id}`, formData);
  }

  deleteProduct(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }
}


