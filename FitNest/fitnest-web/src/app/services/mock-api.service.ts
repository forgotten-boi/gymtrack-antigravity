import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService, Workout, Athlete } from './api.service';

@Injectable()
export class MockApiService extends ApiService {
    private workouts: Workout[] = [
        {
            id: '1',
            userId: 'user1',
            tenantId: 'tenant1',
            workoutDate: new Date(),
            status: 'PendingVerification',
            exercises: [
                { name: 'Squat', sets: 3, reps: 5, weight: 100, weightUnit: 'kg', order: 1 }
            ]
        }
    ];

    createWorkout(workout: Workout): Observable<any> {
        console.log('Mock Create Workout:', workout);
        this.workouts.push({ ...workout, id: Math.random().toString() });
        return of({ success: true });
    }

    getWorkouts(userId: string, tenantId: string): Observable<Workout[]> {
        return of(this.workouts);
    }

    getWorkoutById(id: string): Observable<Workout> {
        return of(this.workouts.find(w => w.id === id) || {} as Workout);
    }

    verifyWorkout(id: string): Observable<any> {
        console.log('Mock Verify Workout:', id);
        const workout = this.workouts.find(w => w.id === id);
        if (workout) {
            workout.status = 'Verified';
        }
        return of({ success: true });
    }

    rejectWorkout(id: string, notes: string): Observable<any> {
        console.log('Mock Reject Workout:', id);
        const workout = this.workouts.find(w => w.id === id);
        if (workout) {
            workout.status = 'Rejected';
        }
        return of({ success: true });
    }

    getAthletes(tenantId: string): Observable<Athlete[]> {
        return of([
            { id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', joinDate: new Date() },
            { id: 'user2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', joinDate: new Date() }
        ]);
    }

    getAthlete(id: string): Observable<Athlete> {
        return of({ id: id, firstName: 'John', lastName: 'Doe', email: 'john@example.com', joinDate: new Date() });
    }

    getAthleteHistory(id: string): Observable<Workout[]> {
        return of(this.workouts.filter(w => w.userId === id));
    }

    submitFeedback(workoutId: string, content: string, rating: number): Observable<any> {
        console.log('Mock Submit Feedback:', workoutId, content, rating);
        return of({ success: true });
    }
}
