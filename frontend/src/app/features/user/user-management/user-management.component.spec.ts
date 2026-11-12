import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { UserManagementComponent } from './user-management.component';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { LogService } from '../../log/log.service';

/** The embedded <app-recent-logs> also calls getUsers() in its ngOnInit — every test starts with 2 calls. */
describe('UserManagementComponent', () => {
  let fixture: ComponentFixture<UserManagementComponent>;
  let component: UserManagementComponent;
  let confirmMock: jest.Mock;

  const users: User[] = [
    { _id: 'u1', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', role: 'Administrator' },
    { _id: 'u2', firstName: 'Erika', lastName: 'Employee', email: 'erika@example.com', role: 'Employee' },
  ];
  const created: User = { _id: 'u3', firstName: 'Max', lastName: 'Power', email: 'max@example.com', role: 'Employee' };

  const userServiceSpy = {
    getUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };
  const logServiceSpy = { getRecentLogs: jest.fn() };

  beforeEach(() => {
    // module-scoped spies accumulate call history across tests
    jest.clearAllMocks();

    // jsdom has no real dialogs
    confirmMock = jest.fn(() => true);
    globalThis.confirm = confirmMock;

    TestBed.configureTestingModule({
      imports: [UserManagementComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: LogService, useValue: logServiceSpy },
      ],
    });

    userServiceSpy.getUsers.mockReturnValue(of(users));
    logServiceSpy.getRecentLogs.mockReturnValue(of([]));

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    delete (globalThis as { confirm?: unknown }).confirm;
  });

  function setForm(values: Partial<{ firstName: string; lastName: string; email: string; password: string; role: string }>): void {
    component.userForm.setValue({
      firstName: values.firstName ?? '',
      lastName: values.lastName ?? '',
      email: values.email ?? '',
      password: values.password ?? '',
      role: values.role ?? 'Employee',
    });
  }

  function submitForm(): void {
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  function userCards(): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll('.user-card');
  }

  it('renders the loaded user list with the add-form heading', () => {
    expect(fixture.nativeElement.querySelector('h2')!.textContent).toContain('Add New User');

    const cards = userCards();
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('Admin User');
    expect(cards[0].textContent).toContain('admin@example.com');
    expect(cards[1].textContent).toContain('Erika Employee');
  });

  it('creates a user from the form and resets it', () => {
    userServiceSpy.createUser.mockReturnValue(of(created));

    setForm({ firstName: 'Max', lastName: 'Power', email: 'max@example.com', password: '', role: 'Employee' });
    submitForm();

    expect(userServiceSpy.createUser).toHaveBeenCalledWith({
      firstName: 'Max',
      lastName: 'Power',
      email: 'max@example.com',
      role: 'Employee',
    });

    expect(userServiceSpy.getUsers).toHaveBeenCalledTimes(3);
    expect(component.userForm.get('firstName')!.value).toBe('');
    expect(component.userForm.get('role')!.value).toBe('Employee');
    expect(component.isEditing()).toBe(false);
    expect(fixture.nativeElement.querySelector('h2')!.textContent).toContain('Add New User');
  });

  it('includes the password in the payload when one is entered', () => {
    userServiceSpy.createUser.mockReturnValue(of(created));

    setForm({ firstName: 'Max', lastName: 'Power', email: 'max@example.com', password: 'S3cret!' });
    submitForm();

    expect(userServiceSpy.createUser).toHaveBeenCalledWith({
      firstName: 'Max',
      lastName: 'Power',
      email: 'max@example.com',
      password: 'S3cret!',
      role: 'Employee',
    });
  });

  it('updates the existing user when in edit mode', () => {
    userServiceSpy.updateUser.mockReturnValue(of({ ...users[0], email: 'root@example.com' }));

    component.editUser(users[0]);
    fixture.detectChanges(); // zoneless: a signal change needs an explicit CD pass
    expect(component.isEditing()).toBe(true);
    expect(fixture.nativeElement.querySelector('h2')!.textContent).toContain('Edit User');
    expect(component.userForm.get('email')!.value).toBe('admin@example.com');

    component.userForm.patchValue({ email: 'root@example.com' });
    submitForm();

    expect(userServiceSpy.updateUser).toHaveBeenCalledWith('u1', {
      firstName: 'Admin',
      lastName: 'User',
      email: 'root@example.com',
      role: 'Administrator',
    });
    expect(userServiceSpy.createUser).not.toHaveBeenCalled();
  });

  it('shows the constraint errors from a 400 response', () => {
    userServiceSpy.createUser.mockReturnValue(
      throwError(() =>
        new HttpErrorResponse({
          status: 400,
          error: {
            message: [
              { constraints: ['email must be an email'] },
              { constraints: ['first name is required'] },
            ],
          },
        }),
      ),
    );

    setForm({ firstName: '', email: 'not-an-email' });
    submitForm();
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.error-summary li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe('email must be an email');
    expect(items[1].textContent).toBe('first name is required');
  });

  it('shows a plain server error message', () => {
    userServiceSpy.createUser.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: { message: 'Database on fire' } })),
    );

    setForm({ firstName: 'Max', email: 'max@example.com' });
    submitForm();
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.error-summary li');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toBe('Database on fire');
  });

  it('deletes the user when the confirm dialog is accepted', () => {
    // the component subscribes to the result — the spy must return an Observable
    userServiceSpy.deleteUser.mockReturnValue(of(undefined));

    const deleteButtons = fixture.debugElement.queryAll(By.css('.user-card .btn-danger'));
    expect(deleteButtons.length).toBe(2);
    deleteButtons[1].nativeElement.click();

    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith('u2');
    expect(userServiceSpy.getUsers).toHaveBeenCalledTimes(3);
  });

  it('does not delete when the confirm dialog is cancelled', () => {
    confirmMock.mockReturnValueOnce(false);

    fixture.debugElement.queryAll(By.css('.user-card .btn-danger'))[0].nativeElement.click();

    expect(userServiceSpy.deleteUser).not.toHaveBeenCalled();
  });
});
