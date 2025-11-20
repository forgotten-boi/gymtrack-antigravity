import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Workout {
  id?: string;
  userId: string;
  tenantId: string;
  workoutDate: Date;
  imageUrl?: string;
  status: string;
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  weightUnit?: string;
  notes?: string;
  order: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Workout endpoints
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
}
