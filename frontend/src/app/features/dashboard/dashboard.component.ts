import { Component, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import {
  DisplayGrid,
  Gridster,
  GridsterConfig,
  GridsterItem,
  GridsterItemConfig,
  GridType,
} from 'angular-gridster2';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridModule } from '@progress/kendo-angular-grid';
import { TechnologyService } from '../technology/technology.service';
import { Technology, RADAR_RINGS, TECHNOLOGY_CATEGORIES } from '../technology/technology.model';
import { LogService } from '../log/log.service';
import { Log } from '../log/log.model';
import { UserService } from '../user/user.service';

type WidgetId = 'rings' | 'categories' | 'technologies' | 'recentlyAdded';
type SavedGeometry = Pick<GridsterItemConfig, 'x' | 'y' | 'cols' | 'rows'>;

interface DashboardWidget extends GridsterItemConfig {
  id: WidgetId;
  title: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Gridster, GridsterItem, DatePipe, NgClass, GridModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private technologyService = inject(TechnologyService);
  private logService = inject(LogService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  private static readonly STORAGE_KEY = 'dashboard-layout';

  private technologies = signal<Technology[]>([]);
  private logs = signal<Log[]>([]);
  private emailByUserId = signal<Record<string, string>>({});

  /** Persisted per-widget geometry (x/y/cols/rows), merged over the defaults below. */
  savedLayout = signal<Partial<Record<WidgetId, SavedGeometry>>>(this.loadLayout());

  ringBars = computed(() => this.toBars(
    RADAR_RINGS.map((ring) => ({
      name: ring,
      count: this.technologies().filter((t) => t.ring === ring).length,
    }))
  ));

  categoryBars = computed(() => this.toBars(
    TECHNOLOGY_CATEGORIES.map((category) => ({
      name: category,
      count: this.technologies().filter((t) => t.category === category).length,
    }))
  ));

  recentTechs = computed(() =>
    [...this.technologies()]
      .filter((t) => t.publishedDate)
      .sort((a, b) => new Date(b.publishedDate!).getTime() - new Date(a.publishedDate!).getTime())
      .slice(0, 5)
      .map((t) => ({ ...t, date: new Date(t.publishedDate!) }))
  );

  widgets = computed<DashboardWidget[]>(() => {
    const defaults: DashboardWidget[] = [
      { id: 'rings', title: 'Ring distribution', x: 0, y: 0, cols: 2, rows: 2 },
      { id: 'categories', title: 'By category', x: 2, y: 0, cols: 2, rows: 2 },
      { id: 'technologies', title: 'Technologies', x: 0, y: 2, cols: 4, rows: 5 },
      { id: 'recentlyAdded', title: 'Recently added', x: 0, y: 7, cols: 2, rows: 2 },
    ];
    return defaults.map((w) => ({ ...w, ...this.savedLayout()[w.id] }));
  });

  ringColors: Record<string, string> = {
    Assess: 'bg-ring-assess',
    Trial: 'bg-ring-trial',
    Adopt: 'bg-ring-adopt',
    Hold: 'bg-ring-hold',
  };

  options: GridsterConfig = {
    gridType: GridType.Fit,
    displayGrid: DisplayGrid.Always,
    margin: 10,
    outerMargin: true,
    swap: true,
    pushItems: true,
    draggable: { enabled: true },
    resizable: { enabled: true },
    minCols: 4,
    maxCols: 4,
    minRows: 1,
    maxRows: 30,
    minItemCols: 1,
    maxItemCols: 4,
    minItemRows: 1,
    maxItemRows: 6,
    addEmptyRowsCount: 0,
    fixedRowHeight: 150,
    keepFixedHeightInMobile: true,
  };

  ngOnInit(): void {
    forkJoin({
      technologies: this.technologyService.getTechnologies(),
      logs: this.logService.getRecentLogs(6),
      users: this.userService.getUsers(),
    }).pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(({ technologies, logs, users }) => {
      this.technologies.set(technologies.filter((t) => t.published));
      this.logs.set(logs);
      this.emailByUserId.set(users.reduce(
        (acc, user) => ({ ...acc, [user._id!]: user.email }),
        {} as Record<string, string>
      ));
    });
  }

  getEmail(userId: string): string {
    return this.emailByUserId()[userId] ?? 'Unknown';
  }

  onItemChanged(item: GridsterItemConfig): void {
    this.saveGeometry(item);
  }

  onItemResized(item: GridsterItemConfig): void {
    this.saveGeometry(item);
  }

  resetLayout(): void {
    localStorage.removeItem(DashboardComponent.STORAGE_KEY);
    this.savedLayout.set({});
  }

  private saveGeometry(item: GridsterItemConfig): void {
    const geometry: SavedGeometry = { x: item.x, y: item.y, cols: item.cols, rows: item.rows };
    const layout = { ...this.savedLayout(), [item['id']]: geometry };
    this.savedLayout.set(layout);
    localStorage.setItem(DashboardComponent.STORAGE_KEY, JSON.stringify(layout));
  }

  private loadLayout(): Partial<Record<WidgetId, SavedGeometry>> {
    try {
      return JSON.parse(localStorage.getItem(DashboardComponent.STORAGE_KEY) ?? '{}');
    } catch {
      return {};
    }
  }

  private toBars(counts: { name: string; count: number }[]): { name: string; count: number; pct: number }[] {
    const max = Math.max(1, ...counts.map((c) => c.count));
    return counts.map((c) => ({ ...c, pct: Math.round((c.count / max) * 100) }));
  }
}
