import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { LoginForm, RegisterForm } from '../types/Auth';
import { NotifierService } from 'angular-notifier';
import { NotifyType } from '../types/Notify';
import { getDatabase, ref, set, onValue, child, get, push, update, remove } from "firebase/database";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated: boolean = false;
  isLoading: boolean = false;
  user: any = {};
  private readonly notifier: NotifierService;

  constructor(private router: Router, notifierService: NotifierService) {
    this.notifier = notifierService;
  }

  getData(updateData: any) {
    this.isLoading = true;
    const db = getDatabase();
    const starCountRef = ref(db, 'users/');
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      updateData(data);
      this.isLoading = false;
      // updateStarCount(postElement, data);
    });
  }

  getById(id: any) {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/${id}`)).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  updateUser(form: any) {
    // this.form.email, this.form.password
    const {id, email, password} = form;
    this.isLoading = true;
    const db = getDatabase();
  
    // A post entry.
    const postData = {
      uid: id,
      email: email,
      password: password,
    };
  
    // Get a key for a new Post.
    // const newPostKey = push(child(ref(db), 'users')).key;
  
    // Write the new post's data simultaneously in the posts list and the user's post list.
    const updates: any = {};
    updates['/users/' + id] = postData;
    // updates['/user-posts/' + uid + '/' + newPostKey] = postData;
  
    return update(ref(db), updates).then((res) => {
      this.notifier.notify(NotifyType.SUCCESS, 'Update successfully');
    }).catch((error) => {
      this.notifier.notify(NotifyType.ERROR, error.message);
    }).finally(() => {
      this.isLoading = false;
    });
  }

  deleteById(id: any) {
    this.isLoading = true;
    const dbRef = ref(getDatabase());
    remove(child(dbRef, `users/${id}`)).then((res) => {
      this.notifier.notify(NotifyType.SUCCESS, 'Delete successfully');
    }).catch((error) => {
      this.notifier.notify(NotifyType.ERROR, error.message);
    }).finally(() => (this.isLoading = false));
  }

  createUser(form: LoginForm) {
    if (this.isLoading) return;

    this.isLoading = true;

    const db = getDatabase();
    const newPostKey = push(child(ref(db), 'users')).key;
    set(ref(db, 'users/' + newPostKey), {
      email: form.email,
      password: form.password,
    })
    .then((res) => {
      console.log(res);
      this.notifier.notify(NotifyType.SUCCESS, 'Created successfully');
    })
    .catch((error) => {
      this.notifier.notify(NotifyType.ERROR, error.message);
    }).finally(() => (this.isLoading = false));
  }

  login(form: LoginForm) {
    if (this.isLoading) return;
    this.isLoading = true;

    const auth = getAuth();
    signInWithEmailAndPassword(auth, form.email, form.password)
      .then((userCredential: any) => {
        this.user = userCredential;

        this.isAuthenticated = true;
        this.router.navigate(['']);
        this.notifier.notify(NotifyType.SUCCESS, 'Login successfully');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        this.isAuthenticated = false;

        this.notifier.notify(NotifyType.ERROR, errorMessage);
      })
      .finally(() => (this.isLoading = false));
  }

  passwordMatched: boolean = true;
  
  register(form: RegisterForm) {
    if (this.isLoading) return;

    this.isLoading = true;

    if (form.password !== form.confirm_password) {
      this.passwordMatched = false;
      this.isLoading = false;
      this.notifier.notify(NotifyType.ERROR, 'Passwords don\'t match. Please recheck your confirm password.');
      return;
    }

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, form.email, form.password)
      .then((userCredential) => {
        this.user = userCredential;

        this.isAuthenticated = true;
        this.router.navigate(['']);
        this.notifier.notify(NotifyType.SUCCESS, 'Login successfully');
      })
      .catch((error) => {
        this.isAuthenticated = false;
        const errorCode = error.code;
        const errorMessage = error.message;
        this.notifier.notify(NotifyType.ERROR, errorMessage);
      })
      .finally(() => (this.isLoading = false));
  }

  logout() {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        this.router.navigate(['login']);
        this.isAuthenticated = false;
        this.user = {};
        // this.notifier.notify(NotifyType.SUCCESS, 'Logout successfully');
      })
      .catch((error) => {
        // An error happened.
      });
  }
}
