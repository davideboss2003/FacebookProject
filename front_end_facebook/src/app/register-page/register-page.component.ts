import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent {
  name = '';
  email = '';
  phoneNumber = '';
  password = '';

  constructor(private userService: UserService, private router: Router) {}

  register() {
    if (!this.name || !this.email || !this.phoneNumber || !this.password) {
      alert('All fields must be completed!');
      return;
    }

    const user = {
      name: this.name,
      email: this.email,
      phoneNumber: this.phoneNumber,
      password: this.password
    };

    this.userService.createUser(user).subscribe({
      next: () => {
        alert('User registered successfully!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        if (typeof err.error === 'string' && err.error.includes('already exists')) {
          alert('Email or phone number already exists!');
        } else {
          alert('Registration failed. Please try again.');
        }
      }
    });
  }
}
