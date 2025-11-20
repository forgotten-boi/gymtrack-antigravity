import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AthleteProfileComponent } from './pages/athlete-profile/athlete-profile.component';
import { WorkoutDetailComponent } from './pages/workout-detail/workout-detail.component';
import { AthleteListComponent } from './pages/athlete-list/athlete-list.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'athletes', component: AthleteListComponent },
    { path: 'athlete/:id', component: AthleteProfileComponent },
    { path: 'workout/:id', component: WorkoutDetailComponent }
];
