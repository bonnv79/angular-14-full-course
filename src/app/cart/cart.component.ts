import { Component, OnInit } from '@angular/core';
import { Book } from '../types/Book';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  constructor(private cartService: CartService) {}

  ngOnInit(): void {}

  getCart() {
    return this.cartService.get();
  }

  getTotalPrice() {
    return this.cartService.getTotalPrice();
  }

  changeCount(event: any) {
    if (event.target.value >= 0) {
      console.log(event.target.value)
    }
  }

  add(book: Book) {
    this.cartService.add(book);
  }

  remove(book: Book) {
    this.cartService.remove(book);
  }
}
