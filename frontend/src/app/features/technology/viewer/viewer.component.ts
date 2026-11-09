import { Component, OnInit, inject, signal } from '@angular/core';
import { TechnologyService } from '../technology.service';
import { Technology } from '../technology.model';

@Component({
  selector: 'app-viewer',
  standalone: true,
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.css'
})
export class ViewerComponent implements OnInit {
  private technologyService = inject(TechnologyService);
  technologies = signal<Record<string, Record<string, Technology[]>>>({});

  ngOnInit(): void {
    this.technologyService.getTechnologies().subscribe((data) => {
      this.technologies.set(
        data
          .filter((tech) => tech.published)
          .reduce((acc, tech) => {
            if (!acc[tech.category]) {
              acc[tech.category] = { Assess: [], Trial: [], Adopt: [], Hold: [] };
            }
            acc[tech.category][tech.ring].push(tech);
            return acc;
          }, {} as Record<string, Record<string, Technology[]>>)
      );
    });
  }

  getKeys(obj: Record<string, any>): string[] {
    return Object.keys(obj);
  }
}
