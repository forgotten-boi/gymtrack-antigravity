import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
    ApiService, Workout, Exercise, ProgressStats, PersonalRecord, AppNotification,
    Meal, NutritionDay, Friend, LeaderboardEntry, ActivityFeedItem, AiChatMessage, AdherenceData
} from './api.service';

@Injectable()
export class GuestApiService extends ApiService {
    private readonly WORKOUTS_KEY = 'guest_workouts';
    private readonly NOTIFICATIONS_KEY = 'guest_notifications';
    private readonly MEALS_KEY = 'guest_meals';
    private readonly CHAT_KEY = 'guest_chat';

    private getStoredWorkouts(): Workout[] {
        const data = localStorage.getItem(this.WORKOUTS_KEY);
        return data ? JSON.parse(data) : [];
    }

    private saveWorkouts(workouts: Workout[]): void {
        localStorage.setItem(this.WORKOUTS_KEY, JSON.stringify(workouts));
    }

    private getStoredMeals(): Meal[] {
        const data = localStorage.getItem(this.MEALS_KEY);
        return data ? JSON.parse(data) : [];
    }

    private saveMeals(meals: Meal[]): void {
        localStorage.setItem(this.MEALS_KEY, JSON.stringify(meals));
    }

    // Workouts
    createWorkout(workout: Workout): Observable<any> {
        const workouts = this.getStoredWorkouts();
        const newWorkout = { ...workout, id: 'local-' + Date.now() };
        workouts.push(newWorkout);
        this.saveWorkouts(workouts);
        return of({ success: true, id: newWorkout.id });
    }

    getWorkouts(userId: string, tenantId: string): Observable<Workout[]> {
        return of(this.getStoredWorkouts());
    }

    getWorkoutById(id: string): Observable<Workout> {
        const workouts = this.getStoredWorkouts();
        return of(workouts.find(w => w.id === id) || {} as Workout);
    }

    analyzeWorkoutImage(imageBase64: string): Observable<{ exercises: Exercise[]; confidence: number }> {
        return of({
            exercises: [
                { name: 'Bench Press', sets: 3, reps: 10, weight: 60, weightUnit: 'kg', order: 1 },
                { name: 'Squat', sets: 4, reps: 8, weight: 80, weightUnit: 'kg', order: 2 }
            ],
            confidence: 0.75
        }).pipe(delay(1000));
    }

    // Progress
    getProgressStats(userId: string): Observable<ProgressStats> {
        const workouts = this.getStoredWorkouts();
        let totalWeight = 0;
        workouts.forEach(w => w.exercises.forEach(e => { totalWeight += (e.weight || 0) * (e.sets || 0) * (e.reps || 0); }));
        return of({ workoutsCompleted: workouts.length, totalWeightLifted: totalWeight, streakDays: Math.min(workouts.length, 7) });
    }

    getPersonalRecords(userId: string): Observable<PersonalRecord[]> {
        const workouts = this.getStoredWorkouts();
        const prMap: { [exercise: string]: { weight: number; unit: string; date: Date } } = {};
        workouts.forEach(w => {
            w.exercises.forEach(e => {
                if (!prMap[e.name] || (e.weight || 0) > prMap[e.name].weight) {
                    prMap[e.name] = { weight: e.weight || 0, unit: e.weightUnit || 'kg', date: w.workoutDate };
                }
            });
        });
        return of(Object.entries(prMap).map(([exercise, data]) => ({ exercise, weight: data.weight, unit: data.unit, date: data.date })));
    }

    getAdherence(userId: string, weeks: number = 8): Observable<AdherenceData> {
        const workouts = this.getStoredWorkouts();
        const weeklyAdherence = [];
        const now = new Date();
        for (let i = 0; i < weeks; i++) {
            const weekStart = new Date(now.getTime() - (weeks - i) * 7 * 86400000);
            const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
            const count = workouts.filter(w => { const d = new Date(w.workoutDate); return d >= weekStart && d < weekEnd; }).length;
            weeklyAdherence.push({ weekStart, workoutCount: count, target: 4, adherencePercent: Math.min(100, Math.round(count * 100 / 4)) });
        }
        const avg = weeklyAdherence.length > 0 ? Math.round(weeklyAdherence.reduce((s, w) => s + w.adherencePercent, 0) / weeklyAdherence.length) : 0;
        return of({ overallAdherence: avg, targetPerWeek: 4, weeklyAdherence });
    }

    // Profile
    getUserProfile(userId: string): Observable<any> {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            const user = JSON.parse(stored);
            return of({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: 'Guest' });
        }
        return of({ id: userId, firstName: 'Guest', lastName: 'User', email: 'guest@local', role: 'Guest' });
    }

    updateProfile(userId: string, profile: any): Observable<any> {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            const user = JSON.parse(stored);
            user.firstName = profile.firstName || user.firstName;
            user.lastName = profile.lastName || user.lastName;
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
        return of({ success: true });
    }

    saveOnboarding(userId: string, data: any): Observable<any> {
        localStorage.setItem('guest_onboarding', JSON.stringify(data));
        return of({ message: 'Onboarding saved locally', onboardingCompleted: true });
    }

    // Notifications
    getNotifications(userId: string): Observable<AppNotification[]> {
        const data = localStorage.getItem(this.NOTIFICATIONS_KEY);
        if (data) return of(JSON.parse(data));
        return of([{ id: 1, title: 'Welcome!', message: 'Welcome to FitNest! Start logging your workouts.', time: new Date(), read: false, type: 'primary' }]);
    }

    markNotificationAsRead(id: number): Observable<any> {
        const data = localStorage.getItem(this.NOTIFICATIONS_KEY);
        if (data) {
            const notifications = JSON.parse(data);
            const notif = notifications.find((n: any) => n.id === id);
            if (notif) notif.read = true;
            localStorage.setItem(this.NOTIFICATIONS_KEY, JSON.stringify(notifications));
        }
        return of({ success: true });
    }

    // Nutrition
    getMeals(userId: string, date: string): Observable<NutritionDay> {
        const meals = this.getStoredMeals().filter(m => m.date === date);
        return of({
            meals,
            totalCalories: meals.reduce((s, m) => s + m.calories, 0),
            totalProtein: meals.reduce((s, m) => s + m.protein, 0),
            totalCarbs: meals.reduce((s, m) => s + m.carbs, 0),
            totalFat: meals.reduce((s, m) => s + m.fat, 0),
            dailyGoal: 2000
        });
    }

    createMeal(meal: Meal): Observable<any> {
        const meals = this.getStoredMeals();
        const newMeal = { ...meal, id: 'local-' + Date.now() };
        meals.push(newMeal);
        this.saveMeals(meals);
        return of(newMeal);
    }

    deleteMeal(id: string): Observable<any> {
        const meals = this.getStoredMeals().filter(m => m.id !== id);
        this.saveMeals(meals);
        return of({ success: true });
    }

    // Social - Guest mode returns empty/mock data with sign-in prompts
    getFriends(userId: string): Observable<Friend[]> { return of([]); }
    addFriend(userId: string, friendId: string): Observable<any> { return of({ success: false, message: 'Sign in to add friends' }); }
    removeFriend(userId: string, friendId: string): Observable<any> { return of({ success: false }); }
    getLeaderboard(userId: string): Observable<LeaderboardEntry[]> { return of([]); }
    getActivityFeed(userId: string): Observable<ActivityFeedItem[]> { return of([]); }
    getSuggestedFriends(userId: string): Observable<Friend[]> { return of([]); }

    // AI Assistant - Basic local responses
    sendAiMessage(message: string, userId: string): Observable<AiChatMessage> {
        const stored = localStorage.getItem(this.CHAT_KEY);
        const history: AiChatMessage[] = stored ? JSON.parse(stored) : [];
        history.push({ role: 'user', content: message, timestamp: new Date() });
        const reply: AiChatMessage = {
            role: 'assistant',
            content: 'Sign in to unlock full AI coaching. For now, here\'s a general tip: consistency is key! Aim for 3-4 workouts per week and gradually increase your weights.',
            responseType: 'text',
            timestamp: new Date()
        };
        history.push(reply);
        localStorage.setItem(this.CHAT_KEY, JSON.stringify(history));
        return of(reply).pipe(delay(500));
    }

    getChatHistory(userId: string): Observable<AiChatMessage[]> {
        const stored = localStorage.getItem(this.CHAT_KEY);
        return of(stored ? JSON.parse(stored) : []);
    }
}
