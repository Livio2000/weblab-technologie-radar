import { Routes, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ViewerComponent } from './features/technology/viewer/viewer.component';
import { AdministrationComponent } from './features/technology/administration/administration.component';
import { UserManagementComponent } from './features/user/user-management/user-management.component';
import { LoginComponent } from './core/auth/login/login.component';
import { AuthService } from './core/auth/auth.service';

const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  if (!authService.isAuthenticated() || !authService.isAdmin()) {
    authService.logout();
    return false;
  }
  return true;
};

export const routes: Routes = [
  { path: '', component: ViewerComponent, canActivate: [AuthService] },
  { path: 'technologies', component: AdministrationComponent, canActivate: [adminGuard] },
  { path: 'users', component: UserManagementComponent, canActivate: [adminGuard] },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' },
];
