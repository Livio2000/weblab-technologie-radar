import { Routes } from '@angular/router';
import { ViewerComponent } from './viewer/viewer.component';
import { AdministrationComponent } from './administration/administration.component';

export const routes: Routes = [
    { path: '', component: ViewerComponent },
    { path: 'administration', component: AdministrationComponent },
];
