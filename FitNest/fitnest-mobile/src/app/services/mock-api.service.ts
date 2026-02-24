import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
    ApiService, Workout, Exercise, ProgressStats, PersonalRecord, AppNotification,
    Meal, NutritionDay, Friend, LeaderboardEntry, ActivityFeedItem, AiChatMessage, AdherenceData
} from './api.service';

@Injectable()
export class MockApiService extends ApiService {
    private workouts: Workout[] = [
        {
            id: '1', userId: 'user1', tenantId: 'tenant1', workoutDate: new Date(), status: 'Verified',
            exercises: [{ name: 'Squat', sets: 3, reps: 5, weight: 100, weightUnit: 'kg', order: 1 }]
        }
    ];

    private meals: Meal[] = [
        { id: '1', userId: 'user1', date: new Date().toISOString().split('T')[0], name: 'Grilled Chicken Salad', calories: 450, protein: 42, carbs: 18, fat: 22, source: 'manual', mealType: 'lunch' },
        { id: '2', userId: 'user1', date: new Date().toISOString().split('T')[0], name: 'Protein Shake', calories: 280, protein: 35, carbs: 20, fat: 8, source: 'manual', mealType: 'snack' },
        { id: '3', userId: 'user1', date: new Date().toISOString().split('T')[0], name: 'Oatmeal with Berries', calories: 350, protein: 12, carbs: 55, fat: 9, source: 'manual', mealType: 'breakfast' },
    ];

    private chatHistory: AiChatMessage[] = [];

    // Workouts
    createWorkout(workout: Workout): Observable<any> {
        this.workouts.push({ ...workout, id: Math.random().toString() });
        return of({ success: true });
    }

    getWorkouts(userId: string, tenantId: string): Observable<Workout[]> {
        return of(this.workouts);
    }

    getWorkoutById(id: string): Observable<Workout> {
        return of(this.workouts.find(w => w.id === id) || {} as Workout);
    }

    analyzeWorkoutImage(imageBase64: string): Observable<{ exercises: Exercise[]; confidence: number }> {
        return of({
            exercises: [
                { name: 'Bench Press', sets: 3, reps: 10, weight: 60, weightUnit: 'kg', order: 1 },
                { name: 'Squat', sets: 4, reps: 8, weight: 80, weightUnit: 'kg', order: 2 },
                { name: 'Deadlift', sets: 3, reps: 5, weight: 100, weightUnit: 'kg', order: 3 }
            ],
            confidence: 0.87
        }).pipe(delay(1500));
    }

    // Progress
    getProgressStats(userId: string): Observable<ProgressStats> {
        return of({ workoutsCompleted: 42, totalWeightLifted: 15400, streakDays: 5 });
    }

    getPersonalRecords(userId: string): Observable<PersonalRecord[]> {
        return of([
            { exercise: 'Squat', weight: 140, unit: 'kg', date: new Date(Date.now() - 864000000) },
            { exercise: 'Bench Press', weight: 100, unit: 'kg', date: new Date(Date.now() - 1728000000) },
            { exercise: 'Deadlift', weight: 180, unit: 'kg', date: new Date(Date.now() - 432000000) },
            { exercise: 'Overhead Press', weight: 60, unit: 'kg', date: new Date(Date.now() - 2592000000) },
            { exercise: 'Barbell Row', weight: 90, unit: 'kg', date: new Date(Date.now() - 1296000000) }
        ]);
    }

    getAdherence(userId: string, weeks: number = 8): Observable<AdherenceData> {
        const weeklyAdherence = [];
        const now = new Date();
        for (let i = 0; i < weeks; i++) {
            const weekStart = new Date(now.getTime() - (weeks - i) * 7 * 86400000);
            const workoutCount = Math.floor(Math.random() * 3) + 2;
            weeklyAdherence.push({ weekStart, workoutCount, target: 4, adherencePercent: Math.min(100, Math.round(workoutCount * 100 / 4)) });
        }
        return of({ overallAdherence: 72, targetPerWeek: 4, weeklyAdherence });
    }

    // Profile
    getUserProfile(userId: string): Observable<any> {
        return of({
            id: userId, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', role: 'Athlete',
            fitnessGoals: 'Build Muscle', experienceLevel: 'Intermediate', height: 178, currentWeight: 82,
            weeklyFrequency: 4, dailyCalorieGoal: 2500, onboardingCompleted: true
        });
    }

    updateProfile(userId: string, profile: any): Observable<any> {
        return of({ success: true });
    }

    saveOnboarding(userId: string, data: any): Observable<any> {
        return of({ message: 'Onboarding completed', onboardingCompleted: true }).pipe(delay(500));
    }

    // Notifications
    getNotifications(userId: string): Observable<AppNotification[]> {
        return of([
            { id: 1, title: 'Workout Verified', message: 'Coach John verified your Leg Day workout.', time: new Date(Date.now() - 3600000), read: false, type: 'success' },
            { id: 2, title: 'New Feedback', message: 'Coach John left feedback on your Push Day.', time: new Date(Date.now() - 7200000), read: true, type: 'primary' },
            { id: 3, title: 'Streak Alert', message: 'You\'re on a 5-day streak! Keep it up!', time: new Date(Date.now() - 86400000), read: true, type: 'warning' }
        ]);
    }

    markNotificationAsRead(id: number): Observable<any> {
        return of({ success: true });
    }

    // Nutrition
    getMeals(userId: string, date: string): Observable<NutritionDay> {
        const todayMeals = this.meals.filter(m => m.date === date);
        const totalCalories = todayMeals.reduce((s, m) => s + m.calories, 0);
        const totalProtein = todayMeals.reduce((s, m) => s + m.protein, 0);
        const totalCarbs = todayMeals.reduce((s, m) => s + m.carbs, 0);
        const totalFat = todayMeals.reduce((s, m) => s + m.fat, 0);
        return of({ meals: todayMeals, totalCalories, totalProtein, totalCarbs, totalFat, dailyGoal: 2500 });
    }

    createMeal(meal: Meal): Observable<any> {
        const newMeal = { ...meal, id: 'mock-' + Date.now() };
        this.meals.push(newMeal);
        return of(newMeal);
    }

    deleteMeal(id: string): Observable<any> {
        this.meals = this.meals.filter(m => m.id !== id);
        return of({ success: true });
    }

    // Social
    getFriends(userId: string): Observable<Friend[]> {
        return of([
            { id: 'f1', firstName: 'Sarah', lastName: 'Connor', email: 'sarah@test.com', workoutsThisWeek: 4, isFriend: true },
            { id: 'f2', firstName: 'Mike', lastName: 'Johnson', email: 'mike@test.com', workoutsThisWeek: 3, isFriend: true },
        ]);
    }

    addFriend(userId: string, friendId: string): Observable<any> { return of({ success: true }); }
    removeFriend(userId: string, friendId: string): Observable<any> { return of({ success: true }); }

    getLeaderboard(userId: string): Observable<LeaderboardEntry[]> {
        return of([
            { rank: 1, userId: 'f1', name: 'Sarah Connor', workoutCount: 5, totalVolume: 12400 },
            { rank: 2, userId: 'user1', name: 'You', workoutCount: 4, totalVolume: 10200 },
            { rank: 3, userId: 'f2', name: 'Mike Johnson', workoutCount: 3, totalVolume: 8600 },
        ]);
    }

    getActivityFeed(userId: string): Observable<ActivityFeedItem[]> {
        return of([
            { userId: 'f1', userName: 'Sarah', type: 'workout', description: 'Completed a Pull Day workout', date: new Date(Date.now() - 3600000) },
            { userId: 'f2', userName: 'Mike', type: 'pr', description: 'New PR on Bench Press: 100kg', date: new Date(Date.now() - 7200000) },
            { userId: 'f1', userName: 'Sarah', type: 'streak', description: 'Hit a 7-day workout streak!', date: new Date(Date.now() - 86400000) },
        ]);
    }

    getSuggestedFriends(userId: string): Observable<Friend[]> {
        return of([
            { id: 's1', firstName: 'Alex', lastName: 'Turner', email: 'alex@test.com', workoutsThisWeek: 5, isFriend: false },
            { id: 's2', firstName: 'Emma', lastName: 'Wilson', email: 'emma@test.com', workoutsThisWeek: 3, isFriend: false },
        ]);
    }

    // AI Assistant
    sendAiMessage(message: string, userId: string): Observable<AiChatMessage> {
        const lower = message.toLowerCase();
        let reply: AiChatMessage;

        if (lower.includes('workout') || lower.includes('plan') || lower.includes('training')) {
            reply = {
                role: 'assistant',
                content: JSON.stringify({
                    planName: 'Push/Pull/Legs Split',
                    days: [
                        { day: 'Monday', focus: 'Push', exercises: ['Bench Press 4x8', 'OHP 3x10', 'Dips 3x12', 'Lateral Raise 3x15'] },
                        { day: 'Wednesday', focus: 'Pull', exercises: ['Deadlift 3x5', 'Pull-ups 4x8', 'Barbell Row 3x10', 'Face Pulls 3x15'] },
                        { day: 'Friday', focus: 'Legs', exercises: ['Squat 4x6', 'Leg Press 3x12', 'RDL 3x10', 'Calf Raise 4x15'] }
                    ]
                }),
                responseType: 'workout_plan', timestamp: new Date()
            };
        } else if (lower.includes('calorie') || lower.includes('diet') || lower.includes('nutrition') || lower.includes('eat')) {
            reply = {
                role: 'assistant',
                content: JSON.stringify({ dailyCalories: 2500, protein: 180, carbs: 280, fat: 83, tip: 'Focus on lean proteins and complex carbs around workouts.' }),
                responseType: 'calorie_card', timestamp: new Date()
            };
        } else if (lower.includes('progress') || lower.includes('stats') || lower.includes('how am i')) {
            reply = {
                role: 'assistant',
                content: JSON.stringify({ workouts: 42, streak: 5, volume: '15,400 kg', trend: 'up', message: 'Great consistency! Your volume is up 12% from last month.' }),
                responseType: 'progress_card', timestamp: new Date()
            };
        } else {
            reply = {
                role: 'assistant',
                content: 'I can help with workout planning, nutrition advice, and progress analysis. Try asking me about a workout plan, your calorie targets, or your progress!',
                responseType: 'text', timestamp: new Date()
            };
        }

        this.chatHistory.push({ role: 'user', content: message, timestamp: new Date() });
        this.chatHistory.push(reply);
        return of(reply).pipe(delay(800));
    }

    getChatHistory(userId: string): Observable<AiChatMessage[]> {
        return of(this.chatHistory);
    }
}
