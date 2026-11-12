import { Component, inject, signal } from '@angular/core';
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
  private authService = inject(AuthService);
  menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((state) => !state);
  }

  logout(): void {
    this.authService.logout();
    this.menuOpen.set(false);
  }
}
