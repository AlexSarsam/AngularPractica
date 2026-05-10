import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar';
import { CartComponent } from './shared/cart/cart';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, CartComponent],
  template: `
    <app-navbar />
    <router-outlet />
    <app-cart />
  `
})
export class App {}
