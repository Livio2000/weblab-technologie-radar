import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TechnologyService } from '../technology.service';
import { Technology } from '../technology.model';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './viewer.component.css'
})
export class ViewerComponent implements OnInit {
  private technologyService = inject(TechnologyService);
  technologies$: Observable<Record<string, Record<string, Technology[]>>> | null = null;

  ngOnInit(): void {
    this.technologies$ = this.technologyService.getTechnologies().pipe(
      map((data) =>
        data
          .filter((tech) => tech.published)
          .reduce((acc, tech) => {
            if (!acc[tech.category]) {
              acc[tech.category] = { Assess: [], Trial: [], Adopt: [], Hold: [] };
            }
            acc[tech.category][tech.ring].push(tech);
            return acc;
          }, {} as Record<string, Record<string, Technology[]>>)
      )
    );
  }

  getKeys(obj: Record<string, any>): string[] {
    return Object.keys(obj);
  }
}
