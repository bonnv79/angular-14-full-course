import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckNumberManyPipeComponent } from '../pipes/check-number-many-pipe.component';
import { BookComponent } from './book/book.component';
import { BooksComponent } from './books.component';
import { CreateBookComponent } from './create-book/create-book.component';

@NgModule({
  declarations: [BooksComponent, BookComponent, CreateBookComponent, CheckNumberManyPipeComponent],
  imports: [CommonModule, FormsModule],
  exports: [BooksComponent],
})
export class BooksModule { }
