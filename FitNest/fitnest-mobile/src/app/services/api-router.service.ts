import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
    ApiService, Workout, Exercise, ProgressStats, PersonalRecord, AppNotification,
    Meal, NutritionDay, Friend, LeaderboardEntry, ActivityFeedItem, AiChatMessage, AdherenceData
} from './api.service';
import { AuthService } from './auth.service';
import { GuestApiService } from './guest-api.service';
import { MockApiService } from './mock-api.service';
import { RealApiService } from './real-api.service';

/**
 * Dynamically delegates to the correct ApiService implementation based on auth state.
 * - useMocks=true  → MockApiService (dev/demo mode)
 * - isGuest        → GuestApiService (all data stored in localStorage, no backend calls)
 * - authenticated  → RealApiService (real backend)
 *
 * Using a router instead of a factory means the correct service is always used even
 * when the user logs in / switches to guest mode after the app has already booted.
 */
@Injectable({ providedIn: 'root' })
export class ApiServiceRouter extends ApiService {
    private readonly _mock: MockApiService;
    private readonly _guest: GuestApiService;
    private readonly _real: RealApiService;

    constructor(private authService: AuthService, private http: HttpClient) {
        super();
        this._mock = new MockApiService();
        this._guest = new GuestApiService();
        this._real = new RealApiService(http);
    }

    private get active(): ApiService {
        if (environment.useMocks) return this._mock;
        if (this.authService.isGuest()) return this._guest;
        return this._real;
    }

    // Workouts
    createWorkout(workout: Workout): Observable<any> { return this.active.createWorkout(workout); }
    updateWorkout(id: string, workout: Workout): Observable<any> { return this.active.updateWorkout(id, workout); }
    deleteWorkout(id: string): Observable<any> { return this.active.deleteWorkout(id); }
    getWorkouts(userId: string, tenantId: string): Observable<Workout[]> { return this.active.getWorkouts(userId, tenantId); }
    getWorkoutById(id: string): Observable<Workout> { return this.active.getWorkoutById(id); }
    analyzeWorkoutImage(imageBase64: string): Observable<{ exercises: Exercise[]; confidence: number }> {
        return this.active.analyzeWorkoutImage(imageBase64);
    }

    // Progress
    getProgressStats(userId: string): Observable<ProgressStats> { return this.active.getProgressStats(userId); }
    getPersonalRecords(userId: string): Observable<PersonalRecord[]> { return this.active.getPersonalRecords(userId); }
    getAdherence(userId: string, weeks?: number): Observable<AdherenceData> { return this.active.getAdherence(userId, weeks); }

    // Profile
    getUserProfile(userId: string): Observable<any> { return this.active.getUserProfile(userId); }
    updateProfile(userId: string, profile: any): Observable<any> { return this.active.updateProfile(userId, profile); }
    saveOnboarding(userId: string, data: any): Observable<any> { return this.active.saveOnboarding(userId, data); }

    // Notifications
    getNotifications(userId: string): Observable<AppNotification[]> { return this.active.getNotifications(userId); }
    markNotificationAsRead(id: number): Observable<any> { return this.active.markNotificationAsRead(id); }

    // Nutrition
    getMeals(userId: string, date: string): Observable<NutritionDay> { return this.active.getMeals(userId, date); }
    createMeal(meal: Meal): Observable<any> { return this.active.createMeal(meal); }
    deleteMeal(id: string): Observable<any> { return this.active.deleteMeal(id); }

    // Social
    getFriends(userId: string): Observable<Friend[]> { return this.active.getFriends(userId); }
    addFriend(userId: string, friendId: string): Observable<any> { return this.active.addFriend(userId, friendId); }
    removeFriend(userId: string, friendId: string): Observable<any> { return this.active.removeFriend(userId, friendId); }
    getLeaderboard(userId: string): Observable<LeaderboardEntry[]> { return this.active.getLeaderboard(userId); }
    getActivityFeed(userId: string): Observable<ActivityFeedItem[]> { return this.active.getActivityFeed(userId); }
    getSuggestedFriends(userId: string): Observable<Friend[]> { return this.active.getSuggestedFriends(userId); }

    // AI Assistant
    sendAiMessage(message: string, userId: string): Observable<AiChatMessage> { return this.active.sendAiMessage(message, userId); }
    getChatHistory(userId: string): Observable<AiChatMessage[]> { return this.active.getChatHistory(userId); }
}
