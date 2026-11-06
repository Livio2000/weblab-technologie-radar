import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Technology } from './technology.model';

@Injectable({ providedIn: 'root' })
export class TechnologyService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/technologies`;

  getTechnologies(): Observable<Technology[]> {
    return this.http.get<Technology[]>(this.baseUrl);
  }

  createTechnology(technology: Technology): Observable<Technology> {
    return this.http.post<Technology>(this.baseUrl, technology);
  }

  updateTechnology(id: string, technology: Technology): Observable<Technology> {
    return this.http.put<Technology>(`${this.baseUrl}/${id}`, technology);
  }

  deleteTechnology(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
