
import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})

export class NavigationComponent {
  menuOpen = signal(false);

  constructor(public authService: AuthService) {}

  toggleMenu(): void {
    this.menuOpen.update((state) => !state);
  }

  logout(): void {
    this.authService.logout();
    this.menuOpen.set(false);
  }
}
