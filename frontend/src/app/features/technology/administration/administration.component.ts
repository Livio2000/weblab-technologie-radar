import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { TechnologyService } from '../technology.service';
import { LogService } from '../../log/log.service';
import { Technology } from '../technology.model';

@Component({
  selector: 'app-administration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './administration.component.html',
  styleUrl: './administration.component.css'
})
export class AdministrationComponent implements OnInit {
  private technologyService = inject(TechnologyService);
  private logService = inject(LogService);

  technologies$: Observable<Technology[]> | null = null;
  technologyForm: Technology = this.resetTechnologyForm();
  isEditing = false;
  errorMessages: string[] = [];

  ngOnInit(): void {
    this.loadTechnologies();
    this.logAdminAccess();
  }

  loadTechnologies(): void {
    this.technologies$ = this.technologyService.getTechnologies();
  }

  private logAdminAccess(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.logService.logAccess(userId).subscribe();
    }
  }

  saveTechnology(): void {
    const technologyData = {
      name: this.technologyForm.name,
      description: this.technologyForm.description,
      category: this.technologyForm.category,
      ring: this.technologyForm.ring,
      ringReason: this.technologyForm.ringReason,
      published: this.technologyForm.published,
    };

    if (this.isEditing) {
      this.technologyService.updateTechnology(this.technologyForm._id!, technologyData).subscribe({
        next: () => {
          this.errorMessages = [];
          this.afterSave();
        },
        error: (error) => this.handleApiError(error),
      });
    } else {
      this.technologyService.createTechnology(technologyData).subscribe({
        next: () => this.afterSave(),
        error: (error) => this.handleApiError(error),
      });
    }
  }

  private handleApiError(error: any): void {
    if (error.status === 400 && Array.isArray(error.error.message)) {
      this.errorMessages = error.error.message.flatMap((err: { constraints: string[] }) => err.constraints);
    } else {
      this.errorMessages = ['An unexpected error occurred.'];
    }
  }

  editTechnology(technology: Technology): void {
    this.technologyForm = { ...technology };
    this.isEditing = true;
  }

  deleteTechnology(id: string): void {
    if (confirm('Are you sure you want to delete this technology?')) {
      this.technologyService.deleteTechnology(id).subscribe(() => this.loadTechnologies());
    }
  }

  togglePublish(technology: Technology): void {
    const updatedTech = {
      name: technology.name,
      description: technology.description,
      category: technology.category,
      ring: technology.ring,
      ringReason: technology.ringReason,
      published: !technology.published,
    };

    this.technologyService.updateTechnology(technology._id!, updatedTech)
      .subscribe(() => this.loadTechnologies());
  }

  resetForm(): void {
    this.technologyForm = this.resetTechnologyForm();
    this.isEditing = false;
    this.errorMessages = [];
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
