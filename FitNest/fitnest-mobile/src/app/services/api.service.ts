import { Observable } from 'rxjs';

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

export abstract class ApiService {
  abstract createWorkout(workout: Workout): Observable<any>;
  abstract getWorkouts(userId: string, tenantId: string): Observable<Workout[]>;
  abstract getWorkoutById(id: string): Observable<Workout>;
}
