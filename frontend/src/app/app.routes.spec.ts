import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { UserService } from './features/user/user.service';
import { LogService } from './features/log/log.service';

/**
 * Router-level integration tests for the guard wiring in app.routes.ts.
 *
 * The real `routes` are used, so this verifies WHICH guard sits on WHICH
 * route. The guards' dependencies (AuthService) are spied; the services the
 * protected components would call are stubbed with empty observables so no
 * HTTP backend is needed at all.
 */
describe('app.routes (guard behavior)', () => {
  let router: Router;

  const authServiceSpy = {
    canActivate: jest.fn(),
    isAuthenticated: jest.fn(),
    isAdmin: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: authServiceSpy },
        // Stub the data layer: the guard test is about routing, not data.
        { provide: UserService, useValue: { getUsers: () => of([]) } },
        { provide: LogService, useValue: { getRecentLogs: () => of([]) } },
      ],
    });

    router = TestBed.inject(Router);
    jest.clearAllMocks();
    authServiceSpy.canActivate.mockReturnValue(true);
    authServiceSpy.isAuthenticated.mockReturnValue(true);
    authServiceSpy.isAdmin.mockReturnValue(false);

    // Park on an unguarded route first: navigating to '/' while already at
    // '/' would short-circuit before any guard runs.
    await router.navigateByUrl('/login');
  });

  it('blocks an unauthenticated user from / and keeps them on /login', async () => {
    authServiceSpy.canActivate.mockReturnValue(false);

    await router.navigateByUrl('/');

    expect(authServiceSpy.canActivate).toHaveBeenCalled();
    expect(router.url).toBe('/login');
  });

  it('blocks an authenticated non-admin from /users and logs them out', async () => {
    await router.navigateByUrl('/users');

    expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(authServiceSpy.isAdmin).toHaveBeenCalled();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(router.url).toBe('/login');
  });

  it('allows an admin through to /users', async () => {
    authServiceSpy.isAdmin.mockReturnValue(true);

    await router.navigateByUrl('/users');

    expect(authServiceSpy.logout).not.toHaveBeenCalled();
    expect(router.url).toBe('/users');
  });
});
