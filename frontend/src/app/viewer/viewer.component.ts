import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Technology {
  name: string;
  description: string;
  category: 'Techniques' | 'Tools' | 'Platforms' | 'Languages & Frameworks';
  ring: 'Assess' | 'Trial' | 'Adopt' | 'Hold';
  published: boolean;
}

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {
  private http = inject(HttpClient);
  technologies$: Observable<Record<string, Record<string, Technology[]>>> | null = null;

  ngOnInit(): void {
    this.technologies$ = this.http.get<Technology[]>('http://localhost:4000/v1/technologies').pipe(
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
