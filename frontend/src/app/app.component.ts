import { Component } from '@angular/core';
import { ViewerComponent } from './viewer/viewer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Technologie-Radar';
}
