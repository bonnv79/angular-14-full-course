import { Injectable } from '@angular/core';
import { Book } from '../types/Book';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: any = {
  "-NWu1TYyPtNcG6gZxcpD": {
      "author": "robert c martin",
      "image": "https://images-na.ssl-images-amazon.com/images/I/41zoxjP9lcL._SX323_BO1,204,203,200_.jpg",
      "name": "clean code",
      "price": "700",
      "id": "-NWu1TYyPtNcG6gZxcpD",
      "count": 1
    }
  };

  constructor() {}

  add(book: Book) {
    this.cart[book.id] = {
      ...book,
      count: (this.cart[book.id]?.count || 0) + 1
    }
    // console.log(JSON.stringify(this.cart));
  }

  get() {
    const data: any = Object.values(this.cart);
    return data;
  }

  remove(book: Book) {
    if (this.cart[book.id]?.count == 1) {
      delete this.cart[book.id];
      return;
    }

    this.cart[book.id] = {
      ...book,
      count: (this.cart[book.id]?.count || 0) - 1
    }
    // console.log(this.cart);
  }

  delete(id: string) {
    delete this.cart[id];
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
