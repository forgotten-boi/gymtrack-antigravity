import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

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

    constructor(
        private apiService: ApiService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        const user = this.authService.currentUserValue;
        const userId = user?.id || '1';

        this.apiService.getProgressStats(userId).subscribe(stats => {
            this.stats = stats;
        });

        this.apiService.getPersonalRecords(userId).subscribe(prs => {
            this.prs = prs;
        });
    }
}
