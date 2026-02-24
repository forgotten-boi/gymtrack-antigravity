import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService, Workout, Athlete } from './api.service';

@Injectable()
export class RealApiService extends ApiService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {
        super();
    }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth_token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    createWorkout(workout: Workout): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/workouts`, workout, {
            headers: this.getHeaders()
        });
    }

    getWorkouts(userId: string, tenantId: string): Observable<Workout[]> {
        return this.http.get<Workout[]>(
            `${this.apiUrl}/api/workouts?userId=${userId}&tenantId=${tenantId}`,
            { headers: this.getHeaders() }
        );
    }

    getWorkoutById(id: string): Observable<Workout> {
        return this.http.get<Workout>(`${this.apiUrl}/api/workouts/${id}`, {
            headers: this.getHeaders()
        });
    }

    verifyWorkout(id: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/workouts/${id}/verify`, { isVerified: true }, {
            headers: this.getHeaders()
        });
    }

    rejectWorkout(id: string, notes: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/workouts/${id}/verify`, { isVerified: false, notes }, {
            headers: this.getHeaders()
        });
    }

    getAthletes(tenantId: string): Observable<Athlete[]> {
        return this.http.get<Athlete[]>(`${this.apiUrl}/api/users/athletes?tenantId=${tenantId}`, {
            headers: this.getHeaders()
        });
    }

    getAthlete(id: string): Observable<Athlete> {
        return this.http.get<Athlete>(`${this.apiUrl}/api/users/${id}`, {
            headers: this.getHeaders()
        });
    }

    getAthleteHistory(id: string): Observable<Workout[]> {
        return this.http.get<Workout[]>(`${this.apiUrl}/api/workouts?userId=${id}`, {
            headers: this.getHeaders()
        });
    }

    submitFeedback(workoutId: string, content: string, rating: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/feedback`, { workoutId, content, rating }, {
            headers: this.getHeaders()
        });
    }
}
