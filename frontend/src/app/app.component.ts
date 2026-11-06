import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavigationComponent } from './core/navigation/navigation.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavigationComponent, RouterModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Technologie-Radar';
}
