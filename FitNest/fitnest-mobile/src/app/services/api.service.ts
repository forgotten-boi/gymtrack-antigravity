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

export interface ProgressStats {
  workoutsCompleted: number;
  totalWeightLifted: number;
  streakDays: number;
}

export interface PersonalRecord {
  exercise: string;
  weight: number;
  unit: string;
  date: Date;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: string;
}

export abstract class ApiService {
  abstract createWorkout(workout: Workout): Observable<any>;
  abstract getWorkouts(userId: string, tenantId: string): Observable<Workout[]>;
  abstract getWorkoutById(id: string): Observable<Workout>;
  abstract getProgressStats(userId: string): Observable<ProgressStats>;
  abstract getPersonalRecords(userId: string): Observable<PersonalRecord[]>;
  abstract getUserProfile(userId: string): Observable<any>;
  abstract updateProfile(userId: string, profile: any): Observable<any>;
  abstract getNotifications(userId: string): Observable<AppNotification[]>;
  abstract markNotificationAsRead(id: number): Observable<any>;
}
