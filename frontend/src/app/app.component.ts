import { Component } from '@angular/core';
import { NavigationComponent } from './core/navigation/navigation.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavigationComponent, RouterModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Technologie-Radar';
}
