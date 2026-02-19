import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { ChatWidgetComponent } from '../../components/chat-widget/chat-widget.component';
import { LoadingComponent } from '../../components/loading/loading.component';

@Component({
  selector: 'app-athlete-profile',
  standalone: true,
  imports: [CommonModule, ChatWidgetComponent, LoadingComponent],
  templateUrl: './athlete-profile.component.html',
  styleUrls: ['./athlete-profile.component.css']
})
export class AthleteProfileComponent implements OnInit {
  athlete: any = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading = true;
      this.apiService.getAthlete(id).subscribe({
        next: (athlete) => {
          this.apiService.getAthleteHistory(id).subscribe({
            next: (history) => {
              this.athlete = {
                id: athlete.id,
                name: `${athlete.firstName} ${athlete.lastName}`,
                email: athlete.email,
                joinDate: athlete.joinDate,
                status: 'Active', // Default
                goals: ['Increase Squat PR', 'Improve Mobility'], // Placeholder
                recentWorkouts: history.map(w => ({
                  date: w.workoutDate,
                  name: w.exercises[0]?.name || 'Workout', // Use first exercise as name for now
                  status: w.status
                }))
              };
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Failed to load history', err);
              this.isLoading = false;
            }
          });
        },
        error: (err) => {
          console.error('Failed to load athlete', err);
          this.isLoading = false;
        }
      });
    }
  }
}
