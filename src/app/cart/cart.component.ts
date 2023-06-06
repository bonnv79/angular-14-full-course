import { Component, OnInit } from '@angular/core';
import { BooksService } from '../books/books.service';
import { Book } from '../types/Book';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  constructor(private cartService: CartService, private booksService: BooksService) { }

  ngOnInit(): void { }

  getCart() {
    return this.cartService.get();
  }

  getTotalPrice() {
    const books = this.booksService.getStateBooks(true);
    return this.cartService.getTotalPrice(books);
  }

  getTotalCount() {
    return this.cartService.getTotalCount();
  }

  add(book: Book) {
    this.cartService.add(book);
  }

  remove(book: Book) {
    this.cartService.remove(book);
  }

  getBookById(id: string) {
    return this.booksService.getStateBookById(id);
  }

  isLoading() {
    return this.booksService.isLoading;
  }
}
