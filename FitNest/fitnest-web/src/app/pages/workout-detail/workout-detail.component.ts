import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

import { LoadingComponent } from '../../components/loading/loading.component';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './workout-detail.component.html',
  styleUrls: ['./workout-detail.component.css']
})
export class WorkoutDetailComponent implements OnInit {
  workout: any;
  feedbackContent = '';
  feedbackRating = 5;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading = true;
      this.apiService.getWorkoutById(id).subscribe({
        next: (workout) => {
          this.workout = workout;
          if (!this.workout.exercises) this.workout.exercises = [];
          if (!this.workout.feedback) this.workout.feedback = [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load workout', err);
          this.isLoading = false;
        }
      });
    }
  }

  verifyWorkout() {
    if (this.workout && this.workout.id) {
      this.apiService.verifyWorkout(this.workout.id).subscribe(() => {
        this.workout.status = 'Verified';
      });
    }
  }

  rejectWorkout() {
    if (this.workout && this.workout.id) {
      this.apiService.rejectWorkout(this.workout.id, 'Rejected by coach').subscribe(() => {
        this.workout.status = 'Rejected';
      });
    }
  }

  submitFeedback() {
    if (!this.feedbackContent.trim() || !this.workout || !this.workout.id) return;

    const user = this.authService.currentUserValue;
    this.apiService.submitFeedback(this.workout.id, this.feedbackContent, this.feedbackRating).subscribe(() => {
      this.workout.feedback.push({
        content: this.feedbackContent,
        rating: this.feedbackRating,
        timestamp: new Date(),
        coachName: user ? `${user.firstName} ${user.lastName}` : 'Coach'
      });
      this.feedbackContent = '';
    });
  }
}
