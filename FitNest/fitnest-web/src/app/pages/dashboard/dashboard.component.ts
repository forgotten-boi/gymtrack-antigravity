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
        { title: 'Active Athletes', value: '24', icon: 'users', change: '+3 this week', color: '#667eea' },
        { title: 'Workouts Reviewed', value: '156', icon: 'check-circle', change: '+12% vs last week', color: '#48bb78' },
        { title: 'Pending Reviews', value: '8', icon: 'clock', change: 'Requires attention', alert: true, color: '#e53e3e' },
        { title: 'Avg Adherence', value: '78%', icon: 'trending-up', change: '+4% vs last month', color: '#ed8936' }
    ];

    recentActivity = [
        { user: 'Sarah Conner', action: 'completed a workout', time: '2 mins ago', type: 'workout' },
        { user: 'John Doe', action: 'submitted a check-in', time: '15 mins ago', type: 'checkin' },
        { user: 'Mike Ross', action: 'updated goals', time: '1 hour ago', type: 'goal' },
        { user: 'Rachel Zane', action: 'completed a workout', time: '2 hours ago', type: 'workout' },
        { user: 'Alex Turner', action: 'hit a new PR', time: '3 hours ago', type: 'pr' }
    ];

    weeklyVolume = [
        { week: 'W1', value: 82000, athletes: 18 },
        { week: 'W2', value: 91000, athletes: 20 },
        { week: 'W3', value: 87000, athletes: 19 },
        { week: 'W4', value: 96000, athletes: 22 },
        { week: 'W5', value: 103000, athletes: 22 },
        { week: 'W6', value: 98000, athletes: 21 },
        { week: 'W7', value: 110000, athletes: 24 },
        { week: 'W8', value: 115000, athletes: 24 },
    ];

    topPerformers = [
        { name: 'Sarah Conner', workouts: 5, volume: 12400, adherence: 100, trend: 'up' },
        { name: 'Mike Ross', workouts: 4, volume: 10200, adherence: 80, trend: 'up' },
        { name: 'Rachel Zane', workouts: 4, volume: 9800, adherence: 80, trend: 'stable' },
        { name: 'Alex Turner', workouts: 3, volume: 8600, adherence: 60, trend: 'down' },
        { name: 'John Doe', workouts: 3, volume: 7200, adherence: 60, trend: 'up' },
    ];

    userName = '';

    constructor(private authService: AuthService) {}

    ngOnInit(): void {
        const user = this.authService.currentUserValue;
        this.userName = user ? `${user.firstName}` : 'Coach';
    }

    get maxVolume(): number {
        return Math.max(...this.weeklyVolume.map(w => w.value));
    }

    getBarHeight(value: number): number {
        return Math.round((value / this.maxVolume) * 100);
    }

    formatVolume(value: number): string {
        return (value / 1000).toFixed(0) + 'k';
    }

    getAdherenceColor(adherence: number): string {
        if (adherence >= 80) return '#48bb78';
        if (adherence >= 60) return '#ed8936';
        return '#e53e3e';
    }
}
