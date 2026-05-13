import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { routes } from './app/app.routes';
import { App } from './app/app';

const authInterceptor: HttpInterceptorFn = (peticion, continuar) => {
  const token = localStorage.getItem('access_token');
  return token ? continuar(peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } })) : continuar(peticion);
};

bootstrapApplication(App, {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}).catch(error => console.error(error));




