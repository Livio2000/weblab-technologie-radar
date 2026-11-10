import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { TechnologyService } from '../technology.service';
import { Technology, RADAR_RINGS } from '../technology.model';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [NgClass],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.css'
})
export class ViewerComponent implements OnInit {
  private technologyService = inject(TechnologyService);
  technologies = signal<Record<string, Record<string, Technology[]>>>({});
  selectedCategory = signal<string>('All');
  readonly rings = RADAR_RINGS;
  categoryNames = computed(() => this.categories().map((c) => c.name));
  visibleCategories = computed(() =>
    this.categories().filter(
      (c) => this.selectedCategory() === 'All' || c.name === this.selectedCategory()
    )
  );
  categories = computed(() =>
    Object.entries(this.technologies()).map(([name, rings]) => ({ name, rings }))
  );

  ringStyles: Record<string, { dot: string; card: string }> = {
    Assess: { dot: 'bg-ring-assess', card: 'border-ring-assess' },
    Trial: { dot: 'bg-ring-trial', card: 'border-ring-trial' },
    Adopt: { dot: 'bg-ring-adopt', card: 'border-ring-adopt' },
    Hold: { dot: 'bg-ring-hold', card: 'border-ring-hold' },
  };

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
}
