import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RecentLogsComponent } from './recent-logs.component';
import { LogService } from '../log.service';
import { Log } from '../log.model';
import { UserService } from '../../user/user.service';
import { User } from '../../user/user.model';

describe('RecentLogsComponent', () => {
  let fixture: ComponentFixture<RecentLogsComponent>;
  let component: RecentLogsComponent;
  let httpMock: HttpTestingController;

  const users: User[] = [
    { _id: 'u1', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', role: 'Administrator' },
    { _id: 'u2', firstName: 'Erika', lastName: 'Employee', email: 'erika@example.com', role: 'Employee' },
  ];
  const logs: Log[] = [
    { _id: 'l1', userId: 'u1', logDate: '2026-11-10T12:00:00Z' },
    { _id: 'l2', userId: 'u2', logDate: '2026-11-09T08:30:00Z' },
    { _id: 'l3', userId: 'ghost', logDate: '2026-11-08T09:00:00Z' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RecentLogsComponent],
      providers: [LogService, UserService, provideHttpClientTesting()],
    });

    fixture = TestBed.createComponent(RecentLogsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges(); // ngOnInit → forkJoin fires the /logs and /users requests
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushData(): void {
    httpMock.expectOne((r) => r.url === '/v1/logs').flush(logs);
    httpMock.expectOne('/v1/users').flush(users);
    fixture.detectChanges();
  }

  it('renders one row per log with the mapped email', () => {
    expect(component.logs()).toEqual([]);

    flushData();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain('admin@example.com');
    expect(rows[1].textContent).toContain('erika@example.com');
  });

  it('shows "Unknown" for a user id without a matching user', () => {
    flushData();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows[2].textContent).toContain('Unknown');
  });

  it('renders nothing when there are no logs', () => {
    httpMock.expectOne((r) => r.url === '/v1/logs').flush([]);
    httpMock.expectOne('/v1/users').flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('tbody')).toBeNull();
    expect(component.getEmail('u1')).toBe('Unknown');
  });
});
