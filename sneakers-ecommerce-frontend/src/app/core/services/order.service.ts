import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Order, CreateOrderPayload } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(payload: CreateOrderPayload) {
    return this.http.post<{ message: string; order: Order }>(this.api, payload);
  }

  getMyOrders() {
    return this.http.get<Order[]>(`${this.api}/my-orders`);
  }

  getAllOrders() {
    return this.http.get<Order[]>(this.api);
  }

  updateStatus(orderId: string, status: string) {
    return this.http.patch(`${this.api}/${orderId}/status`, { status });
  }
}

 