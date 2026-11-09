
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { RecentLogsComponent } from '../../log/recent-logs/recent-logs.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [FormsModule, RecentLogsComponent],
  templateUrl: './user-management.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);

  users: User[] = [];
  userForm: User = this.resetUserForm();
  isEditing = false;
  errorMessages: string[] = [];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
    });
  }

  saveUser(): void {
    const requestData: User = {
      firstName: this.userForm.firstName,
      lastName: this.userForm.lastName,
      email: this.userForm.email,
      role: this.userForm.role,
    };
    if (this.userForm.password) {
      requestData.password = this.userForm.password;
    }

    if (this.isEditing) {
      this.userService.updateUser(this.userForm._id!, requestData).subscribe({
        next: () => this.afterSave(),
        error: (error) => this.handleApiError(error),
      });
    } else {
      this.userService.createUser(requestData).subscribe({
        next: () => this.afterSave(),
        error: (error) => this.handleApiError(error),
      });
    }
  }

  private handleApiError(error: any): void {
    if (error.status === 400 && Array.isArray(error.error.message)) {
      this.errorMessages = error.error.message.flatMap((err: { constraints: string[] }) => err.constraints);
    } else if (typeof error.error?.message === 'string') {
      this.errorMessages = [error.error.message];
    } else {
      this.errorMessages = ['An unexpected error occurred.'];
    }
  }

  editUser(user: User): void {
    this.userForm = { ...user, password: '' };
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
    this.errorMessages = [];
  }

  private afterSave(): void {
    this.errorMessages = [];
    this.loadUsers();
    this.resetForm();
  }

  private resetUserForm(): User {
    return { firstName: '', lastName: '', email: '', role: 'Employee' };
  }
}
