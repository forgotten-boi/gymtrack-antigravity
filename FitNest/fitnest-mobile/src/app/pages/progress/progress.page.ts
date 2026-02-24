import { Component, OnInit } from '@angular/core';
import { ApiService, PersonalRecord, AdherenceData } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-progress',
    templateUrl: './progress.page.html',
    styleUrls: ['./progress.page.scss'],
    standalone: false
})
export class ProgressPage implements OnInit {
    activeTab = 'overview';
    stats: any = { workoutsCompleted: 0, totalWeightLifted: 0, streakDays: 0 };
    prs: PersonalRecord[] = [];
    adherence: AdherenceData = { overallAdherence: 0, targetPerWeek: 4, weeklyAdherence: [] };
    private maxPrWeight = 1;
    private prColors = ['#667eea', '#764ba2', '#ed8936', '#48bb78', '#e53e3e', '#3182ce'];

    constructor(private apiService: ApiService, private authService: AuthService) {}

    ngOnInit() {
        const user = this.authService.currentUserValue;
        const userId = user?.id || '1';

        this.apiService.getProgressStats(userId).subscribe(stats => this.stats = stats);
        this.apiService.getPersonalRecords(userId).subscribe(prs => {
            this.prs = prs;
            this.maxPrWeight = Math.max(...prs.map(p => p.weight), 1);
        });
        this.apiService.getAdherence(userId).subscribe(adh => this.adherence = adh);
    }

    getStreakEmoji(): string {
        return this.stats.streakDays >= 7 ? 'flame' : this.stats.streakDays >= 3 ? 'flame' : 'time-outline';
    }

    formatVolume(value: number): string {
        if (!value) return '0';
        return value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toLocaleString();
    }

    getPrBarWidth(weight: number): number {
        return Math.round((weight / this.maxPrWeight) * 100);
    }

    getPrBarColor(index: number): string {
        return this.prColors[index % this.prColors.length];
    }

    getAdherenceBarHeight(adherencePercent: number): number {
        return Math.min(100, Math.max(5, adherencePercent));
    }

    getAdherenceBarColor(adherencePercent: number): string {
        if (adherencePercent >= 100) return '#48bb78';
        if (adherencePercent >= 75) return '#667eea';
        if (adherencePercent >= 50) return '#ed8936';
        return '#e53e3e';
    }

    getWeekLabel(weekStart: Date): string {
        const d = new Date(weekStart);
        return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
    }
}
