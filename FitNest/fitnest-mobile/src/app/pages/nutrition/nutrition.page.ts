import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { ApiService, Meal, NutritionDay } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-nutrition',
    templateUrl: './nutrition.page.html',
    styleUrls: ['./nutrition.page.scss'],
    standalone: false
})
export class NutritionPage implements OnInit {
    selectedDate: string;
    nutritionDay: NutritionDay = { meals: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, dailyGoal: 2000 };
    showAddMeal = false;
    newMeal: Partial<Meal> = { name: '', calories: 0, protein: 0, carbs: 0, fat: 0, mealType: 'lunch', source: 'manual' };
    mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

    constructor(
        private apiService: ApiService,
        private authService: AuthService,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController
    ) {
        this.selectedDate = new Date().toISOString().split('T')[0];
    }

    ngOnInit() {
        this.loadMeals();
    }

    loadMeals() {
        const user = this.authService.currentUserValue;
        const userId = user?.id || '1';
        this.apiService.getMeals(userId, this.selectedDate).subscribe(data => {
            this.nutritionDay = data;
        });
    }

    onDateChange(event: any) {
        this.selectedDate = typeof event === 'string' ? event.split('T')[0] : event.detail?.value?.split('T')[0] || this.selectedDate;
        this.loadMeals();
    }

    get caloriePercent(): number {
        return Math.min(100, Math.round((this.nutritionDay.totalCalories / this.nutritionDay.dailyGoal) * 100));
    }

    get caloriesRemaining(): number {
        return Math.max(0, this.nutritionDay.dailyGoal - this.nutritionDay.totalCalories);
    }

    get proteinPercent(): number {
        const goal = this.nutritionDay.dailyGoal * 0.3 / 4;
        return Math.min(100, Math.round((this.nutritionDay.totalProtein / goal) * 100));
    }

    get carbsPercent(): number {
        const goal = this.nutritionDay.dailyGoal * 0.4 / 4;
        return Math.min(100, Math.round((this.nutritionDay.totalCarbs / goal) * 100));
    }

    get fatPercent(): number {
        const goal = this.nutritionDay.dailyGoal * 0.3 / 9;
        return Math.min(100, Math.round((this.nutritionDay.totalFat / goal) * 100));
    }

    getMealTypeIcon(type: string): string {
        switch (type) {
            case 'breakfast': return 'sunny-outline';
            case 'lunch': return 'restaurant-outline';
            case 'dinner': return 'moon-outline';
            case 'snack': return 'cafe-outline';
            default: return 'nutrition-outline';
        }
    }

    getMealsByType(type: string): Meal[] {
        return this.nutritionDay.meals.filter(m => m.mealType === type);
    }

    get activeMealTypes(): string[] {
        return this.mealTypes.filter(t => this.getMealsByType(t).length > 0);
    }

    openAddMeal() {
        this.newMeal = { name: '', calories: 0, protein: 0, carbs: 0, fat: 0, mealType: 'lunch', source: 'manual' };
        this.showAddMeal = true;
    }

    async saveMeal() {
        if (!this.newMeal.name || !this.newMeal.calories) {
            const toast = await this.toastCtrl.create({ message: 'Please enter a name and calories', duration: 2000, color: 'warning' });
            await toast.present();
            return;
        }

        const user = this.authService.currentUserValue;
        const meal: Meal = {
            userId: user?.id || '1',
            date: this.selectedDate,
            name: this.newMeal.name || '',
            calories: this.newMeal.calories || 0,
            protein: this.newMeal.protein || 0,
            carbs: this.newMeal.carbs || 0,
            fat: this.newMeal.fat || 0,
            mealType: this.newMeal.mealType || 'snack',
            source: 'manual'
        };

        this.apiService.createMeal(meal).subscribe(async () => {
            this.showAddMeal = false;
            this.loadMeals();
            const toast = await this.toastCtrl.create({ message: 'Meal added!', duration: 1500, color: 'success' });
            await toast.present();
        });
    }

    async deleteMeal(meal: Meal) {
        const alert = await this.alertCtrl.create({
            header: 'Delete Meal',
            message: `Remove "${meal.name}"?`,
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete', role: 'destructive',
                    handler: () => {
                        this.apiService.deleteMeal(meal.id!).subscribe(() => this.loadMeals());
                    }
                }
            ]
        });
        await alert.present();
    }

    quickAdd(name: string, cal: number, protein: number, carbs: number, fat: number, type: string) {
        const user = this.authService.currentUserValue;
        const meal: Meal = { userId: user?.id || '1', date: this.selectedDate, name, calories: cal, protein, carbs, fat, mealType: type, source: 'manual' };
        this.apiService.createMeal(meal).subscribe(() => this.loadMeals());
    }
}
