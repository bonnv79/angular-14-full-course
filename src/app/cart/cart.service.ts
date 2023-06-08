import { Injectable } from '@angular/core';
import { LOCAL_STORAGE_KEY_NAMES } from '../constants';
import { Book } from '../types/Book';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: any = {};

  constructor() {
    this.cart = this.getCache();
  }

  getCache() {
    const cart = localStorage.getItem(LOCAL_STORAGE_KEY_NAMES.CART);
    return cart ? JSON.parse(cart) : {};
  }

  setCache() {
    localStorage.setItem(LOCAL_STORAGE_KEY_NAMES.CART, JSON.stringify(this.cart));
  }

  get(isObject?: boolean) {
    // const books = this.booksService.getStateBooks();
    // const keys = Object.keys(this.cart);
    // console.log('get cart');
    // return keys.map(key => ({
    //   ...this.cart[key],
    //   ...books[key],
    //   id: key
    // }));
    if (isObject) {
      return this.cart;
    }
    const data: any[] = Object.values(this.cart);
    return data;
  }

  set(value: any) {
    this.cart = value;
  }

  add(book: Book) {
    this.cart[book.id] = {
      id: book.id,
      count: (this.cart[book.id]?.count || 0) + 1
    };
    this.setCache();
  }

  remove(book: Book) {
    if (this.cart[book.id]?.count == 1) {
      delete this.cart[book.id];
    } else {
      this.cart[book.id] = {
        ...this.cart[book.id],
        count: (this.cart[book.id]?.count || 0) - 1
      }
    }

    this.setCache();
  }

  delete(id: string) {
    delete this.cart[id];
    this.setCache();
  }

  getTotalPrice(books: any) {
    let total = 0;

    this.get().forEach((item: any) => {
      const countItem = Number(item?.count);
      const priceItem = Number(books[item?.id]?.price);
      total += priceItem * countItem;
    });

    return total;
  }

  getTotalCount() {
    let count = 0;

    this.get().forEach((item: any) => {
      count += Number(item?.count);
    });

    return count;
  }

  checkInCart(id: string) {
    return this.cart[id];
  }
}
