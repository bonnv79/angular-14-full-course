import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { getDatabase, ref, set, onValue, child, get, push, update, remove } from "firebase/database";
import { AuthService } from '../auth/auth.service';
import { CartService } from '../cart/cart.service';
import { Book } from '../types/Book';
import { NotifyType } from '../types/Notify';

const TABLE_NAME = 'books';

@Injectable({
  providedIn: 'root',
})
export class BooksService {
  isLoading: boolean = false;
  private readonly notifier: NotifierService;
  private books: any = {};
  private arrayBooks: any = [];

  constructor(
    private router: Router,
    notifierService: NotifierService,
    private authService: AuthService,
    private cartService: CartService
  ) {
    this.notifier = notifierService;
  }

  getStateBooks(isObject?: boolean) {
    return isObject ? this.books : this.arrayBooks;
  }

  getStateBookById(id: string) {
    return {
      ...this.getStateBooks(true)?.[id],
      id
    };
  }

  parseData(data: any) {
    return Object.keys(data).map(key => ({ ...data[key], id: key }));
  }

  getBooks(callback?: Function) {
    this.isLoading = true;
    const db = getDatabase();
    const starCountRef = ref(db, `${TABLE_NAME}/`);

    onValue(starCountRef, (snapshot) => {
      let data = snapshot.val();
      if (data) {
        this.books = data;
        this.arrayBooks = this.parseData(data);
  
        if (callback) {
          callback(data);
        }
      }
      this.isLoading = false;
      console.log(data);
    });
  }

  getById(id: string, callback?: Function) {
    this.isLoading = true;

    const dbRef = ref(getDatabase());
    get(child(dbRef, `${TABLE_NAME}/${id}`)).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data && callback) {
          callback(data);
          this.notifier.notify(NotifyType.SUCCESS, 'Geted successfully');
        }
      } else {
        this.notifier.notify(NotifyType.ERROR, 'No data available');
      }
    }).catch((error) => {
      this.notifier.notify(NotifyType.ERROR, error.message);
    }).finally(() => this.isLoading = false);
  }

  createBook(form: Book, callback: Function) {
    if (this.isLoading) return;

    this.isLoading = true;

    const db = getDatabase();
    const newKey = push(child(ref(db), TABLE_NAME)).key || Date.now();
    const newItem = {
      name: form.name,
      author: form.author,
      image: form.image,
      price: form.price,
    };

    set(ref(db, `${TABLE_NAME}/` + newKey), newItem)
      .then((res) => {
        callback();
        this.notifier.notify(NotifyType.SUCCESS, 'Created successfully');
      })
      .catch((error) => {
        this.notifier.notify(NotifyType.ERROR, error.message);
      }).finally(() => (this.isLoading = false));
  }

  updateBook(form: Book, callback: Function) {
    this.isLoading = true;
    const db = getDatabase();

    const newItem = {
      name: form.name,
      author: form.author,
      image: form.image,
      price: form.price,
    };

    // Get a key for a new Post.
    // const newPostKey = push(child(ref(db), 'users')).key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    const updates: any = {};
    updates[`/${TABLE_NAME}/` + form.id] = newItem;
    // updates['/user-posts/' + uid + '/' + newPostKey] = postData;

    return update(ref(db), updates).then((res) => {
      this.notifier.notify(NotifyType.SUCCESS, 'Update successfully');
      // this.cartService.update(form.id, newItem);
      callback();
    }).catch((error) => {
      this.notifier.notify(NotifyType.ERROR, error.message);
    }).finally(() => {
      this.isLoading = false;
    });
  }

  deleteById(id: string) {
    this.isLoading = true;
    const dbRef = ref(getDatabase());

    remove(child(dbRef, `${TABLE_NAME}/${id}`)).then((res) => {
      this.notifier.notify(NotifyType.SUCCESS, 'Delete successfully');
      this.cartService.delete(id);
    }).catch((error) => {
      this.notifier.notify(NotifyType.ERROR, error.message);
    }).finally(() => (this.isLoading = false));
  }
}
