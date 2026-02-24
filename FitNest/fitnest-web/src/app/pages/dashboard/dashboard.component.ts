import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    stats = [
        { title: 'Active Athletes', value: '24', icon: 'users', change: '+3 this week' },
        { title: 'Workouts Reviewed', value: '156', icon: 'check-circle', change: '+12% vs last week' },
        { title: 'Pending Reviews', value: '8', icon: 'clock', change: 'Requires attention', alert: true },
        { title: 'Total Revenue', value: '$4,250', icon: 'dollar-sign', change: '+5% vs last month' }
    ];

    recentActivity = [
        { user: 'Sarah Conner', action: 'completed a workout', time: '2 mins ago', type: 'workout' },
        { user: 'John Doe', action: 'submitted a check-in', time: '15 mins ago', type: 'checkin' },
        { user: 'Mike Ross', action: 'updated goals', time: '1 hour ago', type: 'goal' },
        { user: 'Rachel Zane', action: 'completed a workout', time: '2 hours ago', type: 'workout' }
    ];

    userName = '';

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        const user = this.authService.currentUserValue;
        this.userName = user ? `${user.firstName}` : 'Coach';
    }
}
