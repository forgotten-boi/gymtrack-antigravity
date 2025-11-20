import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LoadingController, ToastController } from '@ionic/angular';
import { ApiService, Workout, Exercise } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-workout-capture',
    templateUrl: './workout-capture.page.html',
    styleUrls: ['./workout-capture.page.scss'],
})
export class WorkoutCapturePage {
    capturedImage: string | undefined;
    exercises: Exercise[] = [];
    isAnalyzing = false;

    constructor(
        private apiService: ApiService,
        private authService: AuthService,
        private loadingController: LoadingController,
        private toastController: ToastController,
        private router: Router
    ) { }

    async captureWorkout() {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Base64,
                source: CameraSource.Camera
            });

            this.capturedImage = `data:image/jpeg;base64,${image.base64String}`;
            await this.analyzeWorkout(this.capturedImage);
        } catch (error) {
            console.error('Error capturing photo:', error);
            this.showToast('Failed to capture photo');
        }
    }

    async analyzeWorkout(imageBase64: string) {
        this.isAnalyzing = true;
        const loading = await this.loadingController.create({
            message: 'Analyzing workout with AI...',
        });
        await loading.present();

        try {
            // TODO: Call backend AI analysis endpoint
            // For now, mock the response
            await new Promise(resolve => setTimeout(resolve, 2000));

            this.exercises = [
                { name: 'Bench Press', sets: 3, reps: 10, weight: 135, weightUnit: 'lbs', order: 1 },
                { name: 'Squat', sets: 3, reps: 8, weight: 225, weightUnit: 'lbs', order: 2 },
                { name: 'Deadlift', sets: 1, reps: 5, weight: 315, weightUnit: 'lbs', order: 3 }
            ];

            this.showToast('Workout analyzed successfully!');
        } catch (error) {
            console.error('Error analyzing workout:', error);
            this.showToast('Failed to analyze workout');
        } finally {
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

        const loading = await this.loadingController.create({
            message: 'Saving workout...',
        });
        await loading.present();

        try {
            const workout: Workout = {
                userId: user.id,
                tenantId: user.tenantId,
                workoutDate: new Date(),
                imageUrl: this.capturedImage, // Ideally upload to storage first and get URL
                status: 'PendingVerification',
                exercises: this.exercises
            };

            this.apiService.createWorkout(workout).subscribe({
                next: () => {
                    this.showToast('Workout saved successfully!');
                    this.router.navigate(['/home']);
                },
                error: (err) => {
                    console.error('Error saving workout:', err);
                    this.showToast('Failed to save workout');
                }
            });
        } catch (error) {
            console.error('Error saving workout:', error);
            this.showToast('Failed to save workout');
        } finally {
            await loading.dismiss();
        }
    }

    private async showToast(message: string) {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            position: 'bottom'
        });
        await toast.present();
    }

    removeExercise(index: number) {
        this.exercises.splice(index, 1);
    }
}
