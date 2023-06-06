import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookComponent } from './book/book.component';
import { BooksComponent } from './books.component';
import { CreateBookComponent } from './create-book/create-book.component';

@NgModule({
  declarations: [BooksComponent, BookComponent, CreateBookComponent],
  imports: [CommonModule, FormsModule],
  exports: [BooksComponent],
})
export class BooksModule {}
