import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { LogService } from '../log.service';
import { Log } from '../log.model';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'app-recent-logs',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './recent-logs.component.html'
})
export class RecentLogsComponent implements OnInit {
  private logService = inject(LogService);
  private userService = inject(UserService);

  logs: Log[] = [];
  private emailByUserId: Record<string, string> = {};

  ngOnInit(): void {
    forkJoin({
      logs: this.logService.getRecentLogs(10),
      users: this.userService.getUsers(),
    }).subscribe(({ logs, users }) => {
      this.logs = logs;
      this.emailByUserId = users.reduce(
        (acc, user) => ({ ...acc, [user._id!]: user.email }),
        {} as Record<string, string>
      );
    });
  }

  getEmail(userId: string): string {
    return this.emailByUserId[userId] ?? 'Unknown';
  }
}
