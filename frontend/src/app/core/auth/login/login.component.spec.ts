import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../auth.service';
import { LoginResponse } from '../auth.model';

/**
 * Component tests render the REAL template and drive it like a user would:
 * type into the inputs, submit the form. The real AuthService runs in front,
 * and only the network boundary is faked (HttpTestingController).
 */
describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authService: AuthService;
  let httpMock: HttpTestingController;
  const routerMock = { navigate: jest.fn() };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: Router, useValue: routerMock },
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerMock.navigate.mockClear();
    fixture.detectChanges(); // initial render
  });

  afterEach(() => {
    httpMock.verify();
  });

  /** ngModel listens to the DOM 'input' event, so set the value and dispatch it. */
  function setField(selector: string, value: string): void {
    const input = fixture.debugElement.query(By.css(selector)).nativeElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  /** jsdom doesn't run real form submission, so fire the submit event directly. */
  function submitForm(): void {
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  it('renders the login form without an error initially', () => {
    expect(component.errorMessage()).toBe('');
    expect(fixture.nativeElement.querySelector('h2')!.textContent).toContain('Login');
  });

  it('stores credentials and navigates to / on a successful login', () => {
    setField('input[name="email"]', 'admin@example.com');
    setField('input[name="password"]', 'Test1234');

    // the ngModel → signal wiring is part of the contract:
    expect(component.email()).toBe('admin@example.com');
    expect(component.password()).toBe('Test1234');

    submitForm();

    const req = httpMock.expectOne('/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'admin@example.com',
      password: 'Test1234'
    });

    const credentials: LoginResponse = { token: 't', role: 'Administrator', userId: 'u1' };
    req.flush(credentials);

    expect(authService.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('token')).toBe('t');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('shows an error message when the login is rejected', () => {
    setField('input[name="email"]', 'admin@example.com');
    setField('input[name="password"]', 'wrong');

    submitForm();

    httpMock.expectOne('/v1/auth/login').flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    fixture.detectChanges();
    expect(component.errorMessage()).toBe('Invalid email or password');
    expect(
      fixture.nativeElement.querySelector('p.text-danger')?.textContent,
    ).toContain('Invalid email or password');
    expect(authService.isAuthenticated()).toBe(false);
  });
});
