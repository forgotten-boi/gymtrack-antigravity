import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout-detail.component.html',
  styleUrls: ['./workout-detail.component.css']
})
export class WorkoutDetailComponent implements OnInit {
  workout: any;
  feedbackContent = '';
  feedbackRating = 5;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    // Mock data
    this.workout = {
      id: '1',
      athleteName: 'Sarah Conner',
      date: new Date(),
      imageUrl: 'assets/mock-workout.jpg', // Placeholder
      status: 'PendingVerification',
      exercises: [
        { name: 'Squat', sets: 3, reps: 5, weight: 225, unit: 'lbs' },
        { name: 'Bench Press', sets: 3, reps: 8, weight: 135, unit: 'lbs' }
      ],
      feedback: []
    };
  }

  verifyWorkout() {
    this.workout.status = 'Verified';
    // TODO: Call API
  }

  rejectWorkout() {
    this.workout.status = 'Rejected';
    // TODO: Call API
  }

  submitFeedback() {
    if (!this.feedbackContent.trim()) return;

    this.workout.feedback.push({
      content: this.feedbackContent,
      rating: this.feedbackRating,
      timestamp: new Date(),
      coachName: 'Coach John'
    });

    this.feedbackContent = '';
    // TODO: Call API
  }
}
