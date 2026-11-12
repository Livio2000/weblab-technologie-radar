import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoginResponse } from './auth.model';
import { firstValueFrom } from 'rxjs';

describe('AuthService', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;
  const loginTree = {};
  const routerMock = { navigate: jest.fn(), createUrlTree: jest.fn(() => loginTree) };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClientTesting(),
        { provide: Router, useValue: routerMock },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    routerMock.navigate.mockClear();
    routerMock.createUrlTree.mockClear();
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('logs in via POST /v1/auth/login', async () => {
    const credentials: LoginResponse = { token: 't', role: 'Administrator', userId: 'u1' };

    const pending = firstValueFrom(authService.login('admin@example.com', 'Test1234'));
    const req = httpMock.expectOne('/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'admin@example.com', password: 'Test1234' });

    req.flush(credentials);
    const resp = await pending;
    expect(resp).toEqual(credentials);
  });

  it('returns the /login UrlTree when unauthenticated', () => {
    expect(authService.canActivate()).toBe(loginTree);
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('allows access when authenticated', () => {
    authService.setCredentials({ token: 't', role: 'Employee', userId: 'u1' });

    expect(authService.canActivate()).toBe(true);
    expect(routerMock.createUrlTree).not.toHaveBeenCalled();
  })

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
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
