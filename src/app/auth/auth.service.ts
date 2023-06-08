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
import { isEmpty } from '@firebase/util';
import { LOCAL_STORAGE_KEY_NAMES } from '../constants';
import { CartService } from '../cart/cart.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly notifier: NotifierService;
  // isAuthenticated: boolean = false;
  isLoading: boolean = false;
  private userInfo: any = {};
  private tokenInfo: any = {};

  constructor(private router: Router, notifierService: NotifierService, private cartService: CartService) {
    this.notifier = notifierService;

    const idToken = this.getCookie('idToken');
    const refreshToken = this.getCookie('refreshToken');

    if (idToken) {
      this.tokenInfo = {
        idToken,
        refreshToken
      }
      const userInfo = this.getLocalStorage(LOCAL_STORAGE_KEY_NAMES.USER_INFO);
      if (userInfo) {
        this.userInfo = userInfo;
      }
    }
  }

  handleError(error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;
    this.notifier.notify(NotifyType.ERROR, errorMessage);
  }

  getUserInfo() {
    return this.userInfo;
  }

  setUserInfo(userInfo: any) {
    this.userInfo = userInfo;
    this.setLocalStorage(LOCAL_STORAGE_KEY_NAMES.USER_INFO, this.userInfo);
  }

  getData(updateData: any) {
    this.isLoading = true;
    const db = getDatabase();
    const starCountRef = ref(db, 'users/');
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      // console.log(data);
      updateData(data);
      this.isLoading = false;
      // updateStarCount(postElement, data);
    });
  }

  getById(id: any) {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/${id}`)).then((snapshot) => {
      if (snapshot.exists()) {
        // console.log(snapshot.val());
      } else {
        // console.log("No data available");
      }
    }).catch(error => this.handleError(error));
  }

  updateUser(form: any) {
    // this.form.email, this.form.password
    const { id, email, password } = form;
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
    }).catch(error => this.handleError(error)).finally(() => {
      this.isLoading = false;
    });
  }

  deleteById(id: any) {
    this.isLoading = true;
    const dbRef = ref(getDatabase());
    remove(child(dbRef, `users/${id}`)).then((res) => {
      this.notifier.notify(NotifyType.SUCCESS, 'Delete successfully');
    }).catch(error => this.handleError(error)).finally(() => (this.isLoading = false));
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
        // console.log(res);
        this.notifier.notify(NotifyType.SUCCESS, 'Created successfully');
      })
      .catch(error => this.handleError(error)).finally(() => (this.isLoading = false));
  }

  handleLoginSuccess(userCredential: any) {
    this.setUserInfo(userCredential?.user?.reloadUserInfo);

    // this.tokenInfo = userCredential?.user?.stsTokenManager || {}; // { accessToken, expirationTime, refreshToken }
    this.tokenInfo = userCredential?._tokenResponse || {}; // { expiresIn, idToken, refreshToken }
    const { expiresIn, idToken, refreshToken } = this.tokenInfo || {};
    const time = Number(expiresIn) * 1000;
    this.setCookie('idToken', idToken, time);
    this.setCookie('refreshToken', refreshToken, time);
  }

  login(form: LoginForm) {
    if (this.isLoading) return;
    this.isLoading = true;

    const auth = getAuth();
    signInWithEmailAndPassword(auth, form.email, form.password)
      .then((userCredential: any) => {
        this.handleLoginSuccess(userCredential);

        // this.isAuthenticated = true;
        this.router.navigate(['']);
        // this.notifier.notify(NotifyType.SUCCESS, 'Login successfully');
      })
      .catch(error => this.handleError(error))
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
      .then((userCredential: any) => {
        this.handleLoginSuccess(userCredential);

        // this.isAuthenticated = true;
        this.router.navigate(['']);
        // this.notifier.notify(NotifyType.SUCCESS, 'Register successfully');
      })
      .catch(error => this.handleError(error))
      .finally(() => (this.isLoading = false));
  }

  logout() {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // this.isAuthenticated = false;

        this.deleteAllCookies();
        this.clearLocalStorage();

        // location.replace("/login");
        this.router.navigate(['login']);
        this.userInfo = {};
        this.tokenInfo = {};
        this.cartService.set({});

        // this.notifier.notify(NotifyType.SUCCESS, 'Logout successfully');
      })
      .catch(error => this.handleError(error));
  }

  clearCache() {
    if (!this.checkAuth()) {
      const userInfo = this.getLocalStorage(LOCAL_STORAGE_KEY_NAMES.USER_INFO);

      if (!isEmpty(userInfo)) {
        this.removeLocalStorage(LOCAL_STORAGE_KEY_NAMES.USER_INFO);
        location.replace("/");
      }
    }
  }

  setCookie(cname: string, cvalue: string, cmillisecond: number) {
    const d = new Date();
    // d.setTime(d.getTime() + (exdays*24*60*60*1000));
    d.setTime(d.getTime() + cmillisecond);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  getCookie(cname: string) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  // checkCookie() {
  //   let username: any = this.getCookie("username");
  //   if (username != "") {
  //    alert("Welcome again " + username);
  //   } else {
  //     username = prompt("Please enter your name:", "");
  //     if (username != "" && username != null) {
  //       this.setCookie("username", username, 365);
  //     }
  //   }
  // }

  deleteAllCookies() {
    let cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      let arrayCookie = cookie.split('=');
      const cname = arrayCookie?.[0]?.trim();
      this.setCookie(cname, '', 0);
    }
  }

  checkAuth() {
    return !!this.tokenInfo?.idToken;
  }

  setLocalStorage(keyName: string, value: any) {
    localStorage.setItem(keyName, JSON.stringify(value));
  }

  getLocalStorage(keyName: string) {
    const data = localStorage.getItem(keyName);
    return data ? JSON.parse(data) : {};
  }

  removeLocalStorage(keyName: string) {
    localStorage.removeItem(keyName);
  }

  clearLocalStorage() {
    localStorage.clear();
  }
}
