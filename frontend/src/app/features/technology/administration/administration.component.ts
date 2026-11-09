import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { TechnologyService } from '../technology.service';
import { LogService } from '../../log/log.service';
import { Technology } from '../technology.model';

@Component({
  selector: 'app-administration',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './administration.component.html',
  styleUrl: './administration.component.css'
})
export class AdministrationComponent implements OnInit {
  private technologyService = inject(TechnologyService);
  private logService = inject(LogService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  technologies = signal<Technology[]>([]);
  isEditing = signal(false);
  editingId = signal<string | null>(null);
  errorMessages = signal<string[]>([]);
  technologyForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    category: ['Tools'],
    ring: ['Assess'],
    ringReason: ['', Validators.required],
    published: [false],
  });

  ngOnInit(): void {
    this.loadTechnologies();
    this.logAdminAccess();
  }

  loadTechnologies(): void {
    this.technologyService.getTechnologies()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((data) => this.technologies.set(data));
  }

  private logAdminAccess(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.logService.logAccess(userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
  }

  saveTechnology(): void {
    const technologyData = this.technologyForm.getRawValue() as Technology;

    if (this.isEditing()) {
      this.technologyService.updateTechnology(this.editingId()!, technologyData).subscribe({
        next: () => {
          this.errorMessages.set([]);
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
      this.errorMessages.set(error.error.message.flatMap((err: { constraints: string[] }) => err.constraints));
    } else {
      this.errorMessages.set(['An unexpected error occurred.']);
    }
  }

  editTechnology(technology: Technology): void {
    this.technologyForm.setValue({
      name: technology.name,
      description: technology.description,
      category: technology.category,
      ring: technology.ring,
      ringReason: technology.ringReason,
      published: technology.published
    });
    this.editingId.set(technology._id!);
    this.isEditing.set(true);
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
    this.technologyForm.reset()
    this.editingId.set(null);
    this.isEditing.set(false);
    this.errorMessages.set([]);
  }

  private afterSave(): void {
    this.loadTechnologies();
    this.resetForm();
  }
}
