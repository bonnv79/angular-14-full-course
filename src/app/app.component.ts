import { Component, OnInit } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { AuthService } from './auth/auth.service';
import { BooksService } from './books/books.service';
import { CartService } from './cart/cart.service';
import { firebaseConfig } from './firebase.config';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService, private cartService: CartService, private booksService: BooksService) {
    this.authService.clearCache();
  }

  ngOnInit(): void {
    initializeApp(firebaseConfig);
    this.booksService.getBooks();
  }

  getUserName() {
    let userName = this.getUserInfo()?.email;
    if (userName) {
      const arr = userName.split('@');
      userName = arr?.[0];
    }
    return userName;
  }

  isAuth() {
    return this.authService.checkAuth();
  }

  logout() {
    this.authService.logout();
  }

  getUserInfo() {
    return this.authService.getUserInfo();
  }

  getCount() {
    return this.cartService.getTotalCount();
  }
}
