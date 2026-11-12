import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { UserService } from './features/user/user.service';
import { LogService } from './features/log/log.service';
import { TechnologyService } from './features/technology/technology.service';

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
        // TechnologyService stub: the non-admin redirect to '/' instantiates ViewerComponent
        { provide: UserService, useValue: { getUsers: () => of([]) } },
        { provide: LogService, useValue: { getRecentLogs: () => of([]) } },
        { provide: TechnologyService, useValue: { getTechnologies: () => of([]) } },
      ],
    });

    router = TestBed.inject(Router);
    jest.clearAllMocks();
    authServiceSpy.canActivate.mockReturnValue(true);
    authServiceSpy.isAuthenticated.mockReturnValue(true);
    authServiceSpy.isAdmin.mockReturnValue(false);

    // start at /login so navigating to '/' actually runs the guards
    await router.navigateByUrl('/login');
  });

  it('blocks an unauthenticated user from / and keeps them on /login', async () => {
    authServiceSpy.canActivate.mockReturnValue(false);

    await router.navigateByUrl('/');

    expect(authServiceSpy.canActivate).toHaveBeenCalled();
    expect(router.url).toBe('/login');
  });

  it('redirects an authenticated non-admin away from /users without logging out', async () => {
    await router.navigateByUrl('/users');

    expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(authServiceSpy.isAdmin).toHaveBeenCalled();
    expect(authServiceSpy.logout).not.toHaveBeenCalled();
    expect(router.url).toBe('/');
  });

  it('allows an admin through to /users', async () => {
    authServiceSpy.isAdmin.mockReturnValue(true);

    await router.navigateByUrl('/users');

    expect(authServiceSpy.logout).not.toHaveBeenCalled();
    expect(router.url).toBe('/users');
  });
});
