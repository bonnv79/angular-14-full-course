import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Book } from '../../types/Book';
import { BooksService } from '../books.service';

@Component({
  selector: 'app-create-book',
  templateUrl: './create-book.component.html',
  styleUrls: ['./create-book.component.css'],
})
export class CreateBookComponent implements OnInit {
  data: any = {};
  form: Book = {
    id: '',
    name: '',
    author: '',
    image: '',
    price: 0,
  };
  editModel: boolean = false;

  constructor(private bookService: BooksService) {}

  ngOnInit(): void {
    this.bookService.getBooks((res: any) => {
      if (res) {
        this.data = res;
      }
    })
  }

  getKeys() {
    return Object.keys(this.data || {});
  }

  submit(myForm: NgForm) {
    console.log(this.form);
    if (this.editModel) {
      this.bookService.updateBook(this.form, () => {
        this.reset(myForm);
      });
    } else {
      this.bookService.createBook(this.form, () => {
        this.reset(myForm);
      });
    }
  }

  reset(myForm: NgForm) {
    myForm.reset();
    this.editModel = false;
  }

  deleteById(key: string) {
    this.bookService.deleteById(key);
  }

  setEditForm(id: string, book: Book) {
    this.form = {...book, id};
    this.editModel = true;
  }

  isLoading() {
    return this.bookService.isLoading;
  }
}
