import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, LoginRequest } from '../service/user.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  email = '';
  password = '';

  constructor(private userService: UserService, private router: Router) {}
  

  login() {
    if (!this.email || !this.password) {
      alert('Please enter both email and password.');
      return;
    }

    const loginData: LoginRequest = {
      email: this.email,
      password: this.password
    };

    this.userService.login(loginData).subscribe({
      next: (user) => {
        alert(`Welcome back, ${user.name}!`);
        console.log('Navigating to /main');
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.router.navigate(['/main']); // update this later to main page
      },
      error: (err) => {
      if (typeof err.error === 'string') {
        const errorMessage = err.error.toLowerCase(); // Normalize for safer checks

        if (errorMessage.includes('user not found')) {
          alert('User does not exist!');
        } else if (errorMessage.includes('invalid credentials')) {
          alert('Wrong password!');
        } else if (errorMessage.includes('banned')) {
          alert('You are banned and cannot log in.');
        } else {
          alert('Login failed. Please try again.');
        }
      } else {
        alert('Something went wrong. Please try again.');
      }
    }
    });
  }
}
