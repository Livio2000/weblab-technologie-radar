import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { RecentLogsComponent } from '../../log/recent-logs/recent-logs.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RecentLogsComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);

  users: User[] = [];
  userForm: User = this.resetUserForm();
  isEditing = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
    });
  }

  saveUser(): void {
    const requestData = { ...this.userForm };
    if (!requestData.password) delete requestData.password;

    if (this.isEditing) {
      this.userService.updateUser(this.userForm._id!, requestData).subscribe(() => this.afterSave());
    } else {
      this.userService.createUser(requestData).subscribe(() => this.afterSave());
    }
  }

  editUser(user: User): void {
    this.userForm = { ...user };
    this.isEditing = true;
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }

  resetForm(): void {
    this.userForm = this.resetUserForm();
    this.isEditing = false;
  }

  private afterSave(): void {
    this.loadUsers();
    this.resetForm();
  }

  private resetUserForm(): User {
    return { firstName: '', lastName: '', email: '', role: 'Employee' };
  }
}
