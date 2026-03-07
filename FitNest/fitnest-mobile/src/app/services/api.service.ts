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
  rpe?: number;
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

export interface Meal {
  id?: string;
  userId: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
  imageUrl?: string;
  mealType: string;
}

export interface NutritionDay {
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  dailyGoal: number;
}

export interface Friend {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  workoutsThisWeek: number;
  isFriend: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  workoutCount: number;
  totalVolume: number;
}

export interface ActivityFeedItem {
  userId: string;
  userName: string;
  type: string;
  description: string;
  date: Date;
}

export interface AiChatMessage {
  role: string;
  content: string;
  responseType?: string;
  timestamp?: Date;
}

export interface AdherenceData {
  overallAdherence: number;
  targetPerWeek: number;
  weeklyAdherence: { weekStart: Date; workoutCount: number; target: number; adherencePercent: number }[];
}

export abstract class ApiService {
  // Workouts
  abstract createWorkout(workout: Workout): Observable<any>;
  abstract updateWorkout(id: string, workout: Workout): Observable<any>;
  abstract deleteWorkout(id: string): Observable<any>;
  abstract getWorkouts(userId: string, tenantId: string): Observable<Workout[]>;
  abstract getWorkoutById(id: string): Observable<Workout>;
  abstract analyzeWorkoutImage(imageBase64: string): Observable<{ exercises: Exercise[]; confidence: number }>;

  // Progress
  abstract getProgressStats(userId: string): Observable<ProgressStats>;
  abstract getPersonalRecords(userId: string): Observable<PersonalRecord[]>;
  abstract getAdherence(userId: string, weeks?: number): Observable<AdherenceData>;

  // Profile
  abstract getUserProfile(userId: string): Observable<any>;
  abstract updateProfile(userId: string, profile: any): Observable<any>;
  abstract saveOnboarding(userId: string, data: any): Observable<any>;

  // Notifications
  abstract getNotifications(userId: string): Observable<AppNotification[]>;
  abstract markNotificationAsRead(id: number): Observable<any>;

  // Nutrition
  abstract getMeals(userId: string, date: string): Observable<NutritionDay>;
  abstract createMeal(meal: Meal): Observable<any>;
  abstract deleteMeal(id: string): Observable<any>;

  // Social
  abstract getFriends(userId: string): Observable<Friend[]>;
  abstract addFriend(userId: string, friendId: string): Observable<any>;
  abstract removeFriend(userId: string, friendId: string): Observable<any>;
  abstract getLeaderboard(userId: string): Observable<LeaderboardEntry[]>;
  abstract getActivityFeed(userId: string): Observable<ActivityFeedItem[]>;
  abstract getSuggestedFriends(userId: string): Observable<Friend[]>;

  // AI Assistant
  abstract sendAiMessage(message: string, userId: string): Observable<AiChatMessage>;
  abstract getChatHistory(userId: string): Observable<AiChatMessage[]>;
}
