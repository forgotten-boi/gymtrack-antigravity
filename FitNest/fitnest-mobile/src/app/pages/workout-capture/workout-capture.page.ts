import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoadingController, ToastController } from '@ionic/angular';
import { ApiService, Workout, Exercise } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface ManualExercise {
    name: string;
    sets: number;
    reps: number;
    weight: number;
    weightUnit: string;
    rpe: number;
}

@Component({
    selector: 'app-workout-capture',
    templateUrl: './workout-capture.page.html',
    styleUrls: ['./workout-capture.page.scss'],
    standalone: false,
})
export class WorkoutCapturePage {
    Math = Math;
    capturedImage: string | undefined;
    exercises: Exercise[] = [];
    isAnalyzing = false;
    workoutDate: string = new Date().toISOString();
    mode: 'photo' | 'manual' = 'photo';

    exerciseDatabase = [
        'Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row',
        'Pull-ups', 'Dips', 'Leg Press', 'Romanian Deadlift', 'Lateral Raise',
        'Bicep Curl', 'Tricep Extension', 'Leg Curl', 'Leg Extension', 'Calf Raise'
    ];

    manualExercises: ManualExercise[] = [];
    showExercisePicker = false;
    confidence = 0;

    constructor(
        private apiService: ApiService,
        private authService: AuthService,
        private loadingController: LoadingController,
        private toastController: ToastController,
        private router: Router
    ) { }

    addManualExercise(name: string) {
        this.manualExercises.push({
            name,
            sets: 3,
            reps: 10,
            weight: 0,
            weightUnit: 'kg',
            rpe: 7
        });
        this.showExercisePicker = false;
    }

    removeManualExercise(index: number) {
        this.manualExercises.splice(index, 1);
    }

    convertManualToExercises(): Exercise[] {
        return this.manualExercises.map((e, i) => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
            weightUnit: e.weightUnit,
            rpe: e.rpe,
            order: i + 1
        }));
    }

    async captureWorkout() {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Camera
            });

            this.capturedImage = `data:image/jpeg;base64,${image.base64String}`;
            await this.analyzeWorkout(image.base64String || '');
        } catch (error) {
            console.error('Error capturing photo:', error);
            this.showToast('Failed to capture photo');
        }
    }

    async analyzeWorkout(imageBase64: string) {
        this.isAnalyzing = true;
        const loading = await this.loadingController.create({
            message: 'Analyzing workout with AI...',
            spinner: 'crescent'
        });
        await loading.present();

        try {
            this.apiService.analyzeWorkoutImage(imageBase64).subscribe({
                next: (result) => {
                    this.exercises = result.exercises;
                    this.confidence = Math.round(result.confidence * 100);
                    this.showToast(`Workout analyzed! ${this.confidence}% confidence`);
                    this.isAnalyzing = false;
                    loading.dismiss();
                },
                error: (err) => {
                    console.error('Error analyzing workout:', err);
                    this.showToast('AI analysis unavailable. Try manual entry.');
                    this.isAnalyzing = false;
                    loading.dismiss();
                }
            });
        } catch (error) {
            console.error('Error analyzing workout:', error);
            this.showToast('Failed to analyze workout');
            this.isAnalyzing = false;
            await loading.dismiss();
        }
    }

    async saveWorkout() {
        const user = this.authService.currentUserValue;
        if (!user) {
            this.showToast('You must be logged in to save a workout');
            return;
        }

        const exercisesToSave = this.mode === 'manual'
            ? this.convertManualToExercises()
            : this.exercises;

        if (exercisesToSave.length === 0) {
            this.showToast('Add at least one exercise');
            return;
        }

        const loading = await this.loadingController.create({
            message: 'Saving workout...',
            spinner: 'crescent'
        });
        await loading.present();

        const workout: Workout = {
            userId: user.id,
            tenantId: user.tenantId,
            workoutDate: new Date(this.workoutDate),
            imageUrl: this.capturedImage,
            status: 'PendingVerification',
            exercises: exercisesToSave
        };

        this.apiService.createWorkout(workout).subscribe({
            next: () => {
                loading.dismiss();
                this.showToast('Workout saved successfully!');
                this.router.navigate(['/home']);
            },
            error: (err) => {
                loading.dismiss();
                console.error('Error saving workout:', err);
                this.showToast('Failed to save workout');
            }
        });
    }

    removeExercise(index: number) {
        this.exercises.splice(index, 1);
    }

    private async showToast(message: string) {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            position: 'bottom'
        });
        await toast.present();
    }
}
