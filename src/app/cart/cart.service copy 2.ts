import { Injectable } from '@angular/core';
import { BooksService } from '../books/books.service';
import { LOCAL_STORAGE_KEY_NAMES } from '../constants';
import { Book } from '../types/Book';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: any = {};

  constructor(private booksService: BooksService) {
    this.cart = this.getCache();
  }

  getCache() {
    const cart = localStorage.getItem(LOCAL_STORAGE_KEY_NAMES.CART);
    return cart ? JSON.parse(cart) : {};
  }

  setCache() {
    localStorage.setItem(LOCAL_STORAGE_KEY_NAMES.CART, JSON.stringify(this.cart));
    // localStorage.removeItem(key);
    // localStorage.clear();
  }

  // update(id: string, newValue: any) { // not use
  //   this.cart[id] = {
  //     ...this.cart[id],
  //     ...newValue
  //   };
  //   this.setCache();
  // }

  add(book: Book) {
    this.cart[book.id] = {
      ...book,
      count: (this.cart[book.id]?.count || 0) + 1
    };
    this.setCache();
  }

  get() {
    const books = this.booksService.getStateBooks();
    const keys = Object.keys(this.cart);
    return keys.map(key => ({
      ...this.cart[key],
      ...books[key],
      id: key
    }));
    // const data: any = Object.values(this.cart);
    // return data;
  }

  remove(book: Book) {
    if (this.cart[book.id]?.count == 1) {
      delete this.cart[book.id];
    } else {
      this.cart[book.id] = {
        ...book,
        count: (this.cart[book.id]?.count || 0) - 1
      }
    }

    this.setCache();
  }

  delete(id: string) {
    delete this.cart[id];
    this.setCache();
  }

  getTotalPrice() {
    let count = 0;
    let total = 0;

    this.get().forEach((item: any) => {
      const countItem = Number(item?.count);
      const priceItem = Number(item?.price);
      count += countItem;
      total += priceItem * countItem;
    });

    return {
      count,
      total
    };
  }

  checkInCart(id: string) {
    return this.cart[id];
  }
}
