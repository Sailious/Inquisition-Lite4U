import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from '@core/guards/auth.guard';

export const usersRoutes: Routes = [
  {path: '',redirectTo: '/user/login',pathMatch: 'full'},
  {path: 'login',component: LoginComponent},
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  }
];
