import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  const routerMock = { navigate: jest.fn() };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: {} },
        { provide: Router, useValue: routerMock },
      ],
    });
    authService = TestBed.inject(AuthService);
  });

  it('starts out unauthenticated', () => {
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.isAdmin()).toBe(false);
  });

  it('setCredentials marks the user authenticated with their role', () => {
    authService.setCredentials({ token: 't', role: 'Employee', userId: 'u1' });
    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.userRole()).toBe('Employee');
    expect(authService.isAdmin()).toBe(false);
  });

  it('isAdmin flips for an Administrator', () => {
    authService.setCredentials({ token: 't', role: 'Administrator', userId: 'u1' });
    expect(authService.isAdmin()).toBe(true);
  });

  it('logout clears credentials and navigates to /login', () => {
    authService.setCredentials({ token: 't', role: 'Administrator', userId: 'u1' });
    authService.logout();
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.userRole()).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
