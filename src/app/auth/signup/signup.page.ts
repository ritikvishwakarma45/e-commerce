import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { IonicModule } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: 'signup.page.html',
  styleUrls: ['signup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  providers: [AuthService], 
})
export class _SignupPage {
  showPassword = false;
  showConfirmPassword = false;

  authService = inject(AuthService);

  
  // Removed strong password validator - only checking for basic requirements

  signupForm = new FormGroup({
    name: new FormControl('', [
      Validators.required
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6) // Basic minimum length only
    ]),
    phone: new FormControl('', [
      Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/) // International phone format
    ]),
    address: new FormControl('', [
      Validators.maxLength(200)
    ]),
  });

  constructor() { }

  ngOnInit() {
    this.authService.getCurrentUserDataAndDoc().then((user) => {
      console.log(user);
    })
  }

  // Getter methods for easy access to form controls
  get name() {
    return this.signupForm.get('name');
  }

  get email() {
    return this.signupForm.get('email');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get phone() {
    return this.signupForm.get('phone');
  }

  get address() {
    return this.signupForm.get('address');
  }



  // Helper methods to check specific validation errors
  hasError(controlName: string, errorType: string): boolean {
    const control = this.signupForm.get(controlName);
    return !!(control && control.errors && control.errors[errorType] && (control.dirty || control.touched));
  }

  getErrorMessage(controlName: string): string {
    const control = this.signupForm.get(controlName);
    
    if (!control || !control.errors || (!control.dirty && !control.touched)) {
      return '';
    }

    switch (controlName) {
      case 'name':
        if (control.errors['required']) return 'Full name is required';
        if (control.errors['minlength']) return 'Name must be at least 2 characters';
        if (control.errors['maxlength']) return 'Name must not exceed 50 characters';
        if (control.errors['pattern']) return 'Name can only contain letters and spaces';
        break;
      
      case 'email':
        if (control.errors['required']) return 'Email is required';
        if (control.errors['email'] || control.errors['pattern']) return 'Please enter a valid email address';
        break;
      
      case 'password':
        if (control.errors['required']) return 'Password is required';
        if (control.errors['minlength']) return 'Password must be at least 6 characters';
        break;
      
      case 'phone':
        if (control.errors['pattern']) return 'Please enter a valid phone number';
        break;
      
      case 'address':
        if (control.errors['maxlength']) return 'Address must not exceed 200 characters';
        break;
    }
    
    return '';
  }

  onSubmit() {
   if(this.signupForm.invalid){
    return;
   }    

    const obj:any = {
      ...this.signupForm.value,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
    delete obj.confirmPassword;

    console.log('obj',obj);
    this.authService.register(obj).subscribe({
      next: (res) => {
        console.log(res);
        this.signupForm.reset();
      },
      error: (err) => {
        console.log(err);
      }
    });
   
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
