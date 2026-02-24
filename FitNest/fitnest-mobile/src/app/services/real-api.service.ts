import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService, Workout, ProgressStats, PersonalRecord, AppNotification } from './api.service';

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

    getProgressStats(userId: string): Observable<ProgressStats> {
        return this.http.get<ProgressStats>(`${this.apiUrl}/api/users/${userId}/stats`, {
            headers: this.getHeaders()
        });
    }

    getPersonalRecords(userId: string): Observable<PersonalRecord[]> {
        return this.http.get<PersonalRecord[]>(`${this.apiUrl}/api/users/${userId}/prs`, {
            headers: this.getHeaders()
        });
    }

    getUserProfile(userId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/api/users/${userId}`, {
            headers: this.getHeaders()
        });
    }

    updateProfile(userId: string, profile: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/api/users/${userId}`, profile, {
            headers: this.getHeaders()
        });
    }

    getNotifications(userId: string): Observable<AppNotification[]> {
        return this.http.get<AppNotification[]>(`${this.apiUrl}/api/users/notifications/${userId}`, {
            headers: this.getHeaders()
        });
    }

    markNotificationAsRead(id: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/users/notifications/${id}/read`, {}, {
            headers: this.getHeaders()
        });
    }
}
