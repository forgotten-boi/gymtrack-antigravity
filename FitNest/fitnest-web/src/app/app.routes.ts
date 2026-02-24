import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AthleteProfileComponent } from './pages/athlete-profile/athlete-profile.component';
import { WorkoutDetailComponent } from './pages/workout-detail/workout-detail.component';
import { AthleteListComponent } from './pages/athlete-list/athlete-list.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'athletes', component: AthleteListComponent },
            { path: 'athlete/:id', component: AthleteProfileComponent },
            { path: 'workout/:id', component: WorkoutDetailComponent }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
