import { Component, Input, OnInit } from '@angular/core';
import { CartService } from 'src/app/cart/cart.service';
import { Book } from '../../types/Book';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css'],
})
export class BookComponent implements OnInit {
  @Input() book: Book = {} as Book;
  // isInCart: boolean = false;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    if (!this.book.image || !this.book.image.includes('http')) {
      this.book.image = 'https://img.freepik.com/free-vector/hand-drawn-flat-design-stack-books_23-2149342941.jpg';
    }
  }

  addToCart() {
    // this.isInCart = true;
    this.cartService.add(this.book);
  }

  removeFromCart() {
    // this.isInCart = false;
    this.cartService.remove(this.book);
  }

  isInCart() {
    return this.cartService.checkInCart(this.book.id);
  }
}
