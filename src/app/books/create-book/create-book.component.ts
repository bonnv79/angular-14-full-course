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
  form: Book = {
    id: '',
    name: '',
    author: '',
    image: '',
    price: 0,
  };
  editModel: boolean = false;

  constructor(private booksService: BooksService) { }

  ngOnInit(): void { }

  getBooks() {
    return this.booksService.getStateBooks();
  }

  submit(myForm: NgForm) {
    if (this.editModel) {
      this.booksService.updateBook(this.form, () => {
        this.reset(myForm);
      });
    } else {
      this.booksService.createBook(this.form, () => {
        this.reset(myForm);
      });
    }
  }

  reset(myForm: NgForm) {
    myForm.reset();
    this.editModel = false;
  }

  deleteById(key: string, book: Book) {
    if(confirm(`Are you sure to delete ${book?.name}?`)) {
      this.booksService.deleteById(key);
    }
  }

  setEditForm(id: string) {
    this.booksService.getById(id, (res: Book) => {
      this.form = { ...res, id };
      this.editModel = true;
    });
  }

  isLoading() {
    return this.booksService.isLoading;
  }
}
