import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService, Workout } from './api.service';

@Injectable()
export class MockApiService extends ApiService {
    private workouts: Workout[] = [
        {
            id: '1',
            userId: 'user1',
            tenantId: 'tenant1',
            workoutDate: new Date(),
            status: 'Verified',
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
}
