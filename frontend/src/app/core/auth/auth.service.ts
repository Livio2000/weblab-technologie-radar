import { Injectable, inject, signal, computed } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse } from './auth.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService implements CanActivate {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  isAuthenticated = signal(!!localStorage.getItem('token'));
  userRole = signal(localStorage.getItem('role'));
  isAdmin = computed(() => this.userRole() === 'Administrator');

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password });
  }

  setCredentials(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.role);
    localStorage.setItem('userId', response.userId);

    this.isAuthenticated.set(!!response.token);
    this.userRole.set(response.role);
  }

  canActivate(): boolean {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    this.isAuthenticated.set(false);
    this.userRole.set(null);

    this.router.navigate(['/login']);
  }
}
