import { Component, OnInit } from '@angular/core';
import { Book } from '../types/Book';
import { BooksService } from './books.service';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css'],
})
export class BooksComponent implements OnInit {
  constructor(private booksService: BooksService) { }

  ngOnInit(): void { }

  getBooks() {
    return this.booksService.getStateBooks();
  }

  isLoading() {
    return this.booksService.isLoading;
  }
}
