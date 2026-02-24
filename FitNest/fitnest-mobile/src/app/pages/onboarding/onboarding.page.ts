import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-onboarding',
    templateUrl: './onboarding.page.html',
    styleUrls: ['./onboarding.page.scss'],
    standalone: false
})
export class OnboardingPage {
    step = 1;
    totalSteps = 6;

    data = {
        fitnessGoals: '',
        experienceLevel: '',
        height: 170,
        currentWeight: 70,
        dietaryPreference: '',
        weeklyFrequency: 4
    };

    goals = [
        { value: 'Build Muscle', icon: 'barbell-outline', desc: 'Gain lean muscle mass' },
        { value: 'Lose Weight', icon: 'trending-down-outline', desc: 'Burn fat and get lean' },
        { value: 'Get Stronger', icon: 'flash-outline', desc: 'Increase your max lifts' },
        { value: 'Stay Fit', icon: 'heart-outline', desc: 'Maintain overall fitness' }
    ];

    levels = [
        { value: 'Beginner', icon: 'leaf-outline', desc: '0-6 months training', color: '#48bb78' },
        { value: 'Intermediate', icon: 'fitness-outline', desc: '6 months - 2 years', color: '#667eea' },
        { value: 'Advanced', icon: 'trophy-outline', desc: '2+ years consistent', color: '#764ba2' }
    ];

    diets = [
        { value: 'No Preference', icon: 'restaurant-outline' },
        { value: 'High Protein', icon: 'nutrition-outline' },
        { value: 'Vegetarian', icon: 'leaf-outline' },
        { value: 'Vegan', icon: 'flower-outline' },
        { value: 'Keto', icon: 'flame-outline' }
    ];

    constructor(
        private apiService: ApiService,
        private authService: AuthService,
        private router: Router,
        private toastCtrl: ToastController
    ) {}

    next() {
        if (this.step < this.totalSteps) {
            this.step++;
        }
    }

    back() {
        if (this.step > 1) {
            this.step--;
        }
    }

    selectGoal(value: string) {
        this.data.fitnessGoals = value;
        this.next();
    }

    selectLevel(value: string) {
        this.data.experienceLevel = value;
        this.next();
    }

    selectDiet(value: string) {
        this.data.dietaryPreference = value;
        this.next();
    }

    get progressPercent(): number {
        return this.step / this.totalSteps;
    }

    get canFinish(): boolean {
        return !!this.data.fitnessGoals && !!this.data.experienceLevel;
    }

    async finish() {
        const user = this.authService.currentUserValue;
        const userId = user?.id || '1';

        this.apiService.saveOnboarding(userId, this.data).subscribe(async () => {
            const toast = await this.toastCtrl.create({
                message: 'Welcome to FitNest! Your profile is set up.',
                duration: 2000,
                color: 'success',
                position: 'bottom'
            });
            await toast.present();
            this.router.navigateByUrl('/home');
        });
    }

    getCalorieEstimate(): number {
        const base = this.data.currentWeight * 24;
        const activity = 1.2 + (this.data.weeklyFrequency * 0.05);
        let goal = 0;
        if (this.data.fitnessGoals === 'Build Muscle') goal = 300;
        else if (this.data.fitnessGoals === 'Lose Weight') goal = -400;
        else if (this.data.fitnessGoals === 'Get Stronger') goal = 200;
        return Math.round(base * activity + goal);
    }
}
