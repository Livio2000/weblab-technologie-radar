import { Routes, Router, CanActivateFn  } from '@angular/router';
import { ViewerComponent } from './viewer/viewer.component';
import { AdministrationComponent } from './administration/administration.component';
import { LoginComponent } from './login/login.component';
import { AuthService } from './auth.service';

const adminGuard: CanActivateFn = (route, state) => {
    const authService = new AuthService(new Router());
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      authService.logout();
      return false;
    }
    return true;
  };

export const routes: Routes = [
    { path: '', component: ViewerComponent, canActivate: [AuthService] },
    { path: 'administration', component: AdministrationComponent, canActivate: [adminGuard] },
    { path: 'login', component: LoginComponent },
];
