import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-progress',
    templateUrl: './progress.page.html',
    styleUrls: ['./progress.page.scss'],
})
export class ProgressPage implements OnInit {
    stats = {
        workoutsCompleted: 42,
        totalWeightLifted: 15400, // kg
        streakDays: 5
    };

    prs = [
        { exercise: 'Squat', weight: 140, unit: 'kg', date: new Date(Date.now() - 864000000) },
        { exercise: 'Bench Press', weight: 100, unit: 'kg', date: new Date(Date.now() - 1728000000) },
        { exercise: 'Deadlift', weight: 180, unit: 'kg', date: new Date(Date.now() - 432000000) }
    ];

    constructor() { }

    ngOnInit() {
    }
}
