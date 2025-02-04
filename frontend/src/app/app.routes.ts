import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'viewer', loadChildren: () => import('./viewer/viewer.module').then(m => m.ViewerModule) },
    { path: '', redirectTo: 'viewer', pathMatch: 'full' },
];
