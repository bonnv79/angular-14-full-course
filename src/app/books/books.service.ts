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

  constructor(
    private router: Router, 
    notifierService: NotifierService, 
    private authService: AuthService,
    private cartService: CartService
  ) {
    this.notifier = notifierService;
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
    console.log(newKey, newItem);
    set(ref(db, `${TABLE_NAME}/` + newKey), newItem)
    .then((res) => {
      console.log(res);
      callback();
      this.notifier.notify(NotifyType.SUCCESS, 'Created successfully');
    })
    .catch((error) => {
      this.notifier.notify(NotifyType.ERROR, error.message);
    }).finally(() => (this.isLoading = false));
  }

  getBooks(updateData: Function) {
    this.isLoading = true;
    const db = getDatabase();
    const starCountRef = ref(db, `${TABLE_NAME}/`);

    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      updateData(data);
      this.isLoading = false;
    });
  }

  getById(id: string) {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `${TABLE_NAME}/${id}`)).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
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
