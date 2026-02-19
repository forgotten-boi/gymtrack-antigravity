import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-progress',
    templateUrl: './progress.page.html',
    styleUrls: ['./progress.page.scss'],
})
export class ProgressPage implements OnInit {
    stats: any = {
        workoutsCompleted: 0,
        totalWeightLifted: 0,
        streakDays: 0
    };

    prs: any[] = [];

    constructor(private apiService: ApiService) { }

    ngOnInit() {
        // TODO: Get actual userId from auth service
        const userId = 'user1';

        this.apiService.getProgressStats(userId).subscribe(stats => {
            this.stats = stats;
        });

        this.apiService.getPersonalRecords(userId).subscribe(prs => {
            this.prs = prs;
        });
    }
}
