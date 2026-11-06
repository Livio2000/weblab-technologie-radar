import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Log } from './log.model';

@Injectable({ providedIn: 'root' })
export class LogService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/logs`;

  logAccess(userId: string): Observable<void> {
    return this.http.post<void>(this.baseUrl, { userId });
  }

  getRecentLogs(take = 10): Observable<Log[]> {
    return this.http.get<Log[]>(this.baseUrl, { params: { take: String(take) } });
  }
}
