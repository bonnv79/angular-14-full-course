import { Component, OnInit } from '@angular/core';
import { LoginForm } from 'src/app/types/Auth';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form: LoginForm = {
    email: '',
    password: '',
  };
  data: any;
  user: any = {};
  editModel: boolean = false;
  isLoadUsers: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    if (this.isLoadUsers) {
      this.authService.getData((res: any) => {
        // const mapped = Object.keys(res).map(key => ({ ...res[key], id: key}));
        if (res) {
          this.data = res;
        }
      });
    }
  }

  submit(myForm: any) {
    this.authService.login(this.form);
  }

  isLoading() {
    return this.authService.isLoading;
  }

  createUser(myForm: any) {
    if (this.editModel) {
      this.save();
    } else {
      this.authService.login(this.form);
    }

    myForm.reset();
  }

  getKeys() {
    return this.data ? Object.keys(this.data) : [];
  }

  save() {
    this.authService.updateUser(this.form);
    this.editModel = false;
  }

  deleteById(id: string) {
    this.authService.deleteById(id);
  }

  setEditForm(id: string, val: any) {
    this.form = { ...val, id };
    this.editModel = true;
  }
}
