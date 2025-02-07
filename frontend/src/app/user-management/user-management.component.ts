import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'Administrator' | 'Employee';
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})

export class UserManagementComponent implements OnInit {
  users: User[] = [];
  userForm: User = this.resetUserForm();
  isEditing: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<User[]>('http://localhost:4000/v1/users').subscribe(users => {
      this.users = users;
    });
  }

  saveUser(): void {
    const requestData = { ...this.userForm };
    if (!requestData.password) delete requestData.password;

    if (this.isEditing) {
      this.http.put(`http://localhost:4000/v1/users/${this.userForm._id}`, requestData)
        .subscribe(() => this.afterSave());
    } else {
      this.http.post('http://localhost:4000/v1/users', requestData)
        .subscribe(() => this.afterSave());
    }
  }

  editUser(user: User): void {
    this.userForm = { ...user };
    this.isEditing = true;
  }

  deleteUser(id: string): void {
    if (confirm("Are you sure you want to delete this user?")) {
      this.http.delete(`http://localhost:4000/v1/users/${id}`)
        .subscribe(() => this.loadUsers());
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