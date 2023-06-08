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
  deleteItem: any;
  isForm: boolean = false;

  constructor(private booksService: BooksService) { }

  ngOnInit(): void { }

  getBooks() {
    return this.booksService.getStateBooks();
  }

  submit(myForm: NgForm) {
    if (myForm.form.invalid) {
      return;
    }
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
    this.setForm(false);
  }

  setDeleteItem(key: string, book: Book) {
    this.deleteItem = {
      ...book,
      id: key
    }
  }

  deleteById() {
    if(this.deleteItem?.id) {
      this.booksService.deleteById(this.deleteItem?.id);
      this.deleteItem = null;
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

  setForm(value: boolean) {
    this.isForm = value;
  }

  getForm() {
    return this.isForm || this.editModel;
  }
}
