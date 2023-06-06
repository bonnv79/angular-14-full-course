import { Component, OnInit } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { AuthService } from './auth/auth.service';
import { CartService } from './cart/cart.service';
import { firebaseConfig } from './firebase.config';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private cartService: CartService) {}

  ngOnInit(): void {
    initializeApp(firebaseConfig);
  }

  getUserName() {
    let userName = this.getUserInfo()?.user?.email;
    if (userName) {
      const arr = userName.split('@');
      userName = arr?.[0];
    }
    return userName;
  }

  isAuthenticated() {
    return this.authService.isAuthenticated;
  }

  logout() {
    this.authService.logout();
  }

  getUserInfo() {
    return this.authService.user;
  }

  getCart() {
    return this.cartService.cart;
  }
}
