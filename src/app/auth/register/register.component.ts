import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { RegisterForm } from 'src/app/types/Auth';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  form: RegisterForm = {
    email: '',
    password: '',
    confirm_password: '',
  };

  constructor(private authService: AuthService) { }

  ngOnInit(): void { }

  submit(myForm: NgForm) {
    if (myForm.form.invalid) {
      return;
    }
    this.authService.register(this.form);
  }

  isLoading() {
    return this.authService.isLoading;
  }
}
