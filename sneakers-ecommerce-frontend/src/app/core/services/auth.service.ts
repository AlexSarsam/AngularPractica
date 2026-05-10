import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(this.loadUser());

  constructor(private http: HttpClient) {}

  login(payload: { email: string; password: string }) {
    return this.http.post<{ access_token: string; user: User }>(`${this.api}/login`, payload).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.currentUser.set(res.user);
      })
    );
  }

  register(payload: { email: string; password: string; full_name: string }) {
    return this.http.post(`${this.api}/register`, payload);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean { return !!localStorage.getItem('access_token'); }
  isAdmin(): boolean    { return this.currentUser()?.role === 'admin'; }

  private loadUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
}
