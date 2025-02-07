import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserManagementComponent } from '../user-management/user-management.component';

interface Technology {
  _id?: string;
  name: string;
  description: string;
  category: 'Techniques' | 'Tools' | 'Platforms' | 'Languages & Frameworks';
  ring: 'Assess' | 'Trial' | 'Adopt' | 'Hold';
  ringReason: string;
  published: boolean;
}

interface Log {
  userId: string;
  logDate: string;
}

@Component({
  selector: 'app-administration',
  standalone: true,
  imports: [CommonModule, FormsModule, UserManagementComponent],
  templateUrl: './administration.component.html',
  styleUrl: './administration.component.css'
})

export class AdministrationComponent implements OnInit {
  private http = inject(HttpClient);
  technologies$: Observable<Technology[]> | null = null;
  technologyForm: Technology = this.resetTechnologyForm();
  isEditing: boolean = false;
  logs: Log[] = [];

  ngOnInit(): void {
    this.loadTechnologies();
    this.logAdminAccess();
    this.fetchLogs();
  }

  loadTechnologies(): void {
    this.technologies$ = this.http.get<Technology[]>('http://localhost:4000/v1/technologies');
  }

  private logAdminAccess(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.http.post('http://localhost:4000/v1/logs', { userId }).subscribe();
    }
  }

  private fetchLogs(): void {
    this.http.get<Log[]>('http://localhost:4000/v1/logs').subscribe((logs) => {
      this.logs = logs;
    });
  }

  saveTechnology(): void {
    if (this.isEditing) {
      this.http.put(`http://localhost:4000/v1/technologies/${this.technologyForm._id}`, this.technologyForm)
        .subscribe(() => this.afterSave());
    } else {
      this.http.post('http://localhost:4000/v1/technologies', this.technologyForm)
        .subscribe(() => this.afterSave());
    }
  }

  editTechnology(technology: Technology): void {
    this.technologyForm = { ...technology };
    this.isEditing = true;
  }

  deleteTechnology(id: string): void {
    if (confirm("Are you sure you want to delete this technology?")) {
      this.http.delete(`http://localhost:4000/v1/technologies/${id}`)
        .subscribe(() => this.loadTechnologies());
    }
  }

  togglePublish(technology: Technology): void {
    const updatedTech = { ...technology, published: !technology.published };
    this.http.put(`http://localhost:4000/v1/technologies/${technology._id}`, updatedTech)
      .subscribe(() => this.loadTechnologies());
  }

  resetForm(): void {
    this.technologyForm = this.resetTechnologyForm();
    this.isEditing = false;
  }

  private afterSave(): void {
    this.loadTechnologies();
    this.resetForm();
  }

  private resetTechnologyForm(): Technology {
    return {
      name: '',
      description: '',
      category: 'Tools',
      ring: 'Assess',
      ringReason: '',
      published: false,
    };
  }
}
