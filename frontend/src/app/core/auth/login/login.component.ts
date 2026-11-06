
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  login(): void {
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.authService.setCredentials(response);
        this.router.navigate(['/']);
      },
      error: () => {
        this.errorMessage = 'Invalid email or password';
      }
    });
  }
}
