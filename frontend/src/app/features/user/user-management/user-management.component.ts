import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../user.service';
import { User, UserRole } from '../user.model';
import { RecentLogsComponent } from '../../log/recent-logs/recent-logs.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [ReactiveFormsModule, RecentLogsComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  isEditing = signal(false);
  editingId = signal<string | null>(null);
  errorMessages = signal<string[]>([]);

  userForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.required],
    password: [''],
    role: ['Employee'],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((users) => this.users.set(users));
  }

  saveUser(): void {
    const form = this.userForm.getRawValue() as User;

    const requestData: User = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      role: form.role as UserRole,
    };
    if (form.password) {
      requestData.password = form.password;
    }

    if (this.isEditing()) {
      this.userService.updateUser(this.editingId()!, requestData).subscribe({
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
      this.errorMessages.set(error.error.message.flatMap((err: { constraints: string[] }) => err.constraints));
    } else if (typeof error.error?.message === 'string') {
      this.errorMessages.set([error.error.message]);
    } else {
      this.errorMessages.set(['An unexpected error occurred.']);
    }
  }

  editUser(user: User): void {
    this.userForm.setValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      password: '',
    })
    this.editingId.set(user._id!);
    this.isEditing.set(true);
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }

  resetForm(): void {
    this.userForm.reset();
    this.editingId.set(null);
    this.isEditing.set(false);
    this.errorMessages.set([]);
  }

  private afterSave(): void {
    this.errorMessages.set([]);
    this.loadUsers();
    this.resetForm();
  }
}
