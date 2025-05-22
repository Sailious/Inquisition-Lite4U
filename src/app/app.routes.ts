
import { Routes } from '@angular/router';
import { usersRoutes } from './features/users/users.routing';
import { NotFoundPageComponent } from './features/special/not-found-page/not-found-page.component';


export const routes: Routes = [
  { path: 'user', loadChildren: () => import('./features/users/users.routing').then(m => m.usersRoutes)},
  { path: '', redirectTo: 'user/login', pathMatch: 'full' },
  // { path: '**',component: NotFoundPageComponent},
];