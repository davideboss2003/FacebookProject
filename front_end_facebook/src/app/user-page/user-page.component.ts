import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css'],
  imports: [CommonModule, FormsModule],
})
export class UserPageComponent implements OnInit {
  users: any[] = [];
  editingUserId: number | null = null;
  editedUser: any = {};

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe((data) => {
      this.users = data;
    });
  }

  deleteUser(userId: number) {
    this.userService.deleteUser(userId).subscribe(() => {
      this.users = this.users.filter((u) => u.userId !== userId);
    });
  }

  startEdit(user: any) {
    this.editingUserId = user.userId;
    this.editedUser = { ...user }; // Create a copy
  }

  updateUser() {
    if (this.editingUserId !== null) {
      this.userService.updateUser(this.editingUserId, this.editedUser).subscribe(() => {
        const index = this.users.findIndex(u => u.userId === this.editingUserId);
        if (index > -1) this.users[index] = { ...this.editedUser };
        this.editingUserId = null;
        this.editedUser = {};
      });
    }
  }

  cancelEdit() {
    this.editingUserId = null;
    this.editedUser = {};
  }
}
