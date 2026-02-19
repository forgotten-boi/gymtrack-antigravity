import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService, Workout, ProgressStats, PersonalRecord, AppNotification } from './api.service';

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

    getProgressStats(userId: string): Observable<ProgressStats> {
        return of({
            workoutsCompleted: 42,
            totalWeightLifted: 15400,
            streakDays: 5
        });
    }

    getPersonalRecords(userId: string): Observable<PersonalRecord[]> {
        return of([
            { exercise: 'Squat', weight: 140, unit: 'kg', date: new Date(Date.now() - 864000000) },
            { exercise: 'Bench Press', weight: 100, unit: 'kg', date: new Date(Date.now() - 1728000000) },
            { exercise: 'Deadlift', weight: 180, unit: 'kg', date: new Date(Date.now() - 432000000) }
        ]);
    }

    getUserProfile(userId: string): Observable<any> {
        return of({
            id: userId,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'Athlete'
        });
    }

    updateProfile(userId: string, profile: any): Observable<any> {
        console.log('Mock Update Profile:', profile);
        return of({ success: true });
    }

    getNotifications(userId: string): Observable<AppNotification[]> {
        return of([
            { id: 1, title: 'Workout Verified', message: 'Coach John verified your Leg Day workout.', time: new Date(Date.now() - 3600000), read: false, type: 'success' },
            { id: 2, title: 'New Message', message: 'Coach John sent you a message.', time: new Date(Date.now() - 7200000), read: true, type: 'primary' },
            { id: 3, title: 'Reminder', message: 'Don\'t forget to log your workout today!', time: new Date(Date.now() - 86400000), read: true, type: 'warning' }
        ]);
    }

    markNotificationAsRead(id: number): Observable<any> {
        console.log('Mock Mark Notification Read:', id);
        return of({ success: true });
    }
}
