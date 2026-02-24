import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
    ApiService, Workout, Exercise, ProgressStats, PersonalRecord, AppNotification,
    Meal, NutritionDay, Friend, LeaderboardEntry, ActivityFeedItem, AiChatMessage, AdherenceData
} from './api.service';

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

    // Workouts
    createWorkout(workout: Workout): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/workouts`, workout, { headers: this.getHeaders() });
    }

    getWorkouts(userId: string, tenantId: string): Observable<Workout[]> {
        return this.http.get<Workout[]>(`${this.apiUrl}/api/workouts?userId=${userId}&tenantId=${tenantId}`, { headers: this.getHeaders() });
    }

    getWorkoutById(id: string): Observable<Workout> {
        return this.http.get<Workout>(`${this.apiUrl}/api/workouts/${id}`, { headers: this.getHeaders() });
    }

    analyzeWorkoutImage(imageBase64: string): Observable<{ exercises: Exercise[]; confidence: number }> {
        return this.http.post<{ exercises: Exercise[]; confidence: number }>(
            `${this.apiUrl}/api/workouts/analyze`, { imageBase64 }, { headers: this.getHeaders() }
        );
    }

    // Progress
    getProgressStats(userId: string): Observable<ProgressStats> {
        return this.http.get<ProgressStats>(`${this.apiUrl}/api/users/${userId}/stats`, { headers: this.getHeaders() });
    }

    getPersonalRecords(userId: string): Observable<PersonalRecord[]> {
        return this.http.get<PersonalRecord[]>(`${this.apiUrl}/api/users/${userId}/prs`, { headers: this.getHeaders() });
    }

    getAdherence(userId: string, weeks: number = 8): Observable<AdherenceData> {
        return this.http.get<AdherenceData>(`${this.apiUrl}/api/users/${userId}/adherence?weeks=${weeks}`, { headers: this.getHeaders() });
    }

    // Profile
    getUserProfile(userId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/api/users/${userId}`, { headers: this.getHeaders() });
    }

    updateProfile(userId: string, profile: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/api/users/${userId}`, profile, { headers: this.getHeaders() });
    }

    saveOnboarding(userId: string, data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/users/${userId}/onboarding`, data, { headers: this.getHeaders() });
    }

    // Notifications
    getNotifications(userId: string): Observable<AppNotification[]> {
        return this.http.get<AppNotification[]>(`${this.apiUrl}/api/users/notifications/${userId}`, { headers: this.getHeaders() });
    }

    markNotificationAsRead(id: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/users/notifications/${id}/read`, {}, { headers: this.getHeaders() });
    }

    // Nutrition
    getMeals(userId: string, date: string): Observable<NutritionDay> {
        return this.http.get<NutritionDay>(`${this.apiUrl}/api/nutrition?userId=${userId}&date=${date}`, { headers: this.getHeaders() });
    }

    createMeal(meal: Meal): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/nutrition`, meal, { headers: this.getHeaders() });
    }

    deleteMeal(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/api/nutrition/${id}`, { headers: this.getHeaders() });
    }

    // Social
    getFriends(userId: string): Observable<Friend[]> {
        return this.http.get<Friend[]>(`${this.apiUrl}/api/social/friends/${userId}`, { headers: this.getHeaders() });
    }

    addFriend(userId: string, friendId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/api/social/friends`, { userId, friendId }, { headers: this.getHeaders() });
    }

    removeFriend(userId: string, friendId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/api/social/friends?userId=${userId}&friendId=${friendId}`, { headers: this.getHeaders() });
    }

    getLeaderboard(userId: string): Observable<LeaderboardEntry[]> {
        return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/api/social/leaderboard/${userId}`, { headers: this.getHeaders() });
    }

    getActivityFeed(userId: string): Observable<ActivityFeedItem[]> {
        return this.http.get<ActivityFeedItem[]>(`${this.apiUrl}/api/social/feed/${userId}`, { headers: this.getHeaders() });
    }

    getSuggestedFriends(userId: string): Observable<Friend[]> {
        return this.http.get<Friend[]>(`${this.apiUrl}/api/social/suggested/${userId}`, { headers: this.getHeaders() });
    }

    // AI Assistant
    sendAiMessage(message: string, userId: string): Observable<AiChatMessage> {
        return this.http.post<AiChatMessage>(`${this.apiUrl}/api/ai/chat`, { message, userId }, { headers: this.getHeaders() });
    }

    getChatHistory(userId: string): Observable<AiChatMessage[]> {
        return this.http.get<AiChatMessage[]>(`${this.apiUrl}/api/ai/history/${userId}`, { headers: this.getHeaders() });
    }
}
