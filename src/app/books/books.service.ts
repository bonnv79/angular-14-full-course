import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotifierService } from 'angular-notifier';
import { getDatabase, ref, set, onValue, child, get, push, update, remove, orderByChild, query, equalTo, startAt, endAt, startAfter, endBefore, limitToFirst } from "firebase/database";
import { toLower } from 'lodash';
import { AuthService } from '../auth/auth.service';
import { CartService } from '../cart/cart.service';
import { Book } from '../types/Book';
import { NotifyType } from '../types/Notify';
import { delay } from '../utils';
import { TIME_OUT } from '../constants';

const TABLE_NAME = 'books';

@Injectable({
  providedIn: 'root',
})
export class BooksService {
  isLoading: boolean = false;
  timeout: any = null;
  private readonly notifier: NotifierService;
  private books: any = {};
  private arrayBooks: any = [];
  private filterArrayBooks: any = [];
  private searchKey: string = '';

  constructor(
    private router: Router,
    notifierService: NotifierService,
    private authService: AuthService,
    private cartService: CartService
  ) {
    this.notifier = notifierService;
  }

  setSearchKey(value: string) {
    if (this.router?.routerState?.snapshot?.url !== '/') {
      this.router.navigate(['/']);
    }
    this.searchKey = value;
    this.filterStateBooks();
    // this.filterBooks(); // todo
  }

  getSearchKey() {
    return this.searchKey;
  }

  getStateBooks(isObject?: boolean) {
    return isObject ? this.books : this.arrayBooks;
  }

  getStateBookById(id: string) {
    const book = this.getStateBooks(true)?.[id];
    if (!book) {
      return null;
    }
    return {
      ...this.getStateBooks(true)?.[id],
      id
    };
  }

  parseData(data: any) {
    return Object.keys(data).map(key => ({ ...data[key], id: key }));
  }

  filterStateBooks() {
    const key = toLower(this.searchKey);
    let data = this.arrayBooks;

    if (key) {
      data = this.arrayBooks?.filter((item: any) => {
        const matchName = toLower(item?.name)?.includes(key);
        return matchName;
      });
    }
    this.filterArrayBooks = data;
    // return data;
  }

  getFilterArrayBooks() {
    return this.searchKey ? this.filterArrayBooks : this.arrayBooks;
  }

  filterBooks() {
    const searchKey = toLower(this.searchKey).trim();
    const db = getDatabase();

    const mostViewedPosts = query(
      ref(db, `${TABLE_NAME}/`),
      orderByChild('name'),
      // equalTo(searchKey),
      startAt(searchKey),
      endAt(searchKey + "\uf8ff"),
      // startAfter(searchKey),
      // endBefore(searchKey + "\uf8ff"),
      // limitToFirst(20),

      // startAt("[a-zA-Z0-9]*"),
      // endAt(searchKey + "\uf8ff"),
    );

    onValue(mostViewedPosts, (snapshot) => {
      let data = snapshot.val();
      console.log('123', searchKey, data);
      this.filterArrayBooks = data ? this.parseData(data) : [];
    });
  }

  getBooks(callback?: Function) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.cartService.freshCart({});
      this.isLoading = false;
    }, TIME_OUT);

    this.isLoading = true;
    const db = getDatabase();
    const starCountRef: any = ref(db, `${TABLE_NAME}/`);

    onValue(starCountRef, (snapshot) => {
      let data = snapshot.val();
      if (data) {
        this.books = data;
        this.arrayBooks = this.parseData(data);

        if (callback) {
          callback(data);
        }

        if (this.timeout) {
          clearTimeout(this.timeout);
        }

        this.cartService.freshCart(data);
        console.log(data);
      }
      this.isLoading = false;
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
          // this.notifier.notify(NotifyType.SUCCESS, 'Geted successfully');
        }
      } else {
        this.notifier.notify(NotifyType.ERROR, 'No data available');
      }
    }).catch((error) => {
      this.notifier.notify(NotifyType.ERROR, error.message);
    }).finally(() => this.isLoading = false);
  }

  async createBook(form: Book, callback: Function) {
    if (this.isLoading) return;
    this.isLoading = true;
    await delay(500);

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
      }).finally(() => {
        this.isLoading = false;
      });
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
    }).catch((error) => {
      this.notifier.notify(NotifyType.ERROR, error.message);
    }).finally(() => (this.isLoading = false));
  }
}
