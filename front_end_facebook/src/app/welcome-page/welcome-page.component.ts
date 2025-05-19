// welcome-page.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome-page',
  standalone: true,
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.css']
})
export class WelcomePageComponent {
  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);  // Correct path to login
  }

  goToRegister() {
    console.log('Navigating to register page');  // Check if this prints
    this.router.navigate(['/register']);  // Correct path to register
  }

  goToUsers() {
    this.router.navigate(['/user']); // Adjust if route is named differently
  }

  goToPosts() {
    this.router.navigate(['/posts']);
  }
  
}
