import { Component, OnInit } from '@angular/core';
import { Book } from '../types/Book';
import { BooksService } from './books.service';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css'],
})
export class BooksComponent implements OnInit {
  books: any = [];
  constructor(private booksService: BooksService) {}

  isShowing: boolean = true;

  ngOnInit(): void {
    this.booksService.getBooks((res: any) => {
      if (res) {
        const mapped = Object.keys(res).map(key => ({ ...res[key], id: key})); 
        this.books = mapped;
      }
    });
  }

  isLoading() {
    return this.booksService.isLoading;
  }
}
