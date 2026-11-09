import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { LogService } from '../log.service';
import { Log } from '../log.model';
import { UserService } from '../../user/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-recent-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-logs.component.html'
})
export class RecentLogsComponent implements OnInit {
  private logService = inject(LogService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  logs = signal<Log[]>([]);
  private emailByUserId = signal<Record<string, string>>({});

  ngOnInit(): void {
    forkJoin({
      logs: this.logService.getRecentLogs(10),
      users: this.userService.getUsers(),
    }).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(({ logs, users }) => {
      this.logs.set(logs);
      this.emailByUserId.set(users.reduce(
        (acc, user) => ({ ...acc, [user._id!]: user.email }),
        {} as Record<string, string>
      ));
    });
  }

  getEmail(userId: string): string {
    return this.emailByUserId()[userId] ?? 'Unknown';
  }
}
