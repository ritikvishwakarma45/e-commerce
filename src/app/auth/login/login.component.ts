import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {  Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { catchError, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule],
})
export class LoginComponent  implements OnInit {

  authService = inject(AuthService)
  router = inject(Router)
  errorMessage: string | null = null;


  loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6) // Basic minimum length only
    ])
  });
  constructor() { }

  ngOnInit() {}

  get emailError() {
    const control = this.loginForm.get('email');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Email is required';
      if (control.errors['email']) return 'Please enter a valid email';
    }
    return null;
  }

  get passwordError() {
    const control = this.loginForm.get('password');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Password is required';
      if (control.errors['minlength']) return 'Password must be at least 6 characters';
    }
    return null;
  }


  onLogin() {
    this.errorMessage = null; // Reset error message
    
    if (this.loginForm.invalid) {
      alert()
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.authService.login(this.loginForm.value).pipe(
      catchError(error => {
        // Handle specific Firebase auth errors
        switch (error.code) {
          case 'auth/user-not-found':
            this.errorMessage = 'No user found with this email.';
            break;
          case 'auth/wrong-password':
            this.errorMessage = 'Incorrect password.';
            break;
          case 'auth/invalid-email':
            this.errorMessage = 'The email address is invalid.';
            break;
          default:
            this.errorMessage = 'Login failed. Please check your credentials.';
            console.error('Login error:', error);
        }
        return of(null); // Return a new observable to prevent the stream from completing
      })
    ).subscribe(userCredential => {
      console.log(userCredential);
      if (userCredential) {
        console.log('User logged in:', userCredential.user);
        // Navigate to the dashboard or home page
        this.router.navigate(['/home']);
      }
    });
  }
}



