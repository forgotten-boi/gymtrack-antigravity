import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ApiService, Workout, Exercise } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

export interface ManualExercise {
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
export class WorkoutCapturePage implements OnInit {
    Math = Math;

    // ── Segment / tab ───────────────────────────────────────────────
    mode: 'photo' | 'manual' | 'history' = 'manual';

    // ── Photo mode ──────────────────────────────────────────────────
    capturedImage: string | undefined;
    exercises: Exercise[] = [];
    isAnalyzing = false;
    confidence = 0;

    // ── Manual mode ─────────────────────────────────────────────────
    workoutDate: string = new Date().toISOString();
    manualExercises: ManualExercise[] = [];
    showExercisePicker = false;
    customExerciseName = '';

    exerciseDatabase = [
        'Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row',
        'Pull-ups', 'Chin-ups', 'Dips', 'Leg Press', 'Romanian Deadlift',
        'Lateral Raise', 'Bicep Curl', 'Tricep Extension', 'Hammer Curl',
        'Leg Curl', 'Leg Extension', 'Calf Raise', 'Face Pull', 'Cable Row',
        'Incline Dumbbell Press', 'Hip Thrust', 'Bulgarian Split Squat'
    ];

    // ── History mode ────────────────────────────────────────────────
    pastWorkouts: Workout[] = [];
    isLoadingHistory = false;
    editingWorkout: Workout | null = null;
    editingExercises: ManualExercise[] = [];
    editingDate: string = '';

    constructor(
        private apiService: ApiService,
        private authService: AuthService,
        private loadingController: LoadingController,
        private toastController: ToastController,
        private alertController: AlertController,
        private router: Router
    ) { }

    ngOnInit() { }

    ionViewWillEnter() {
        if (this.mode === 'history') {
            this.loadHistory();
        }
    }

    onModeChange() {
        if (this.mode === 'history') {
            this.loadHistory();
        }
    }

    // ────────────────────────────────────────────────────────────────
    // PHOTO MODE
    // ────────────────────────────────────────────────────────────────

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
            message: 'Analyzing workout with AI…',
            spinner: 'crescent'
        });
        await loading.present();

        this.apiService.analyzeWorkoutImage(imageBase64).subscribe({
            next: (result) => {
                this.exercises = result.exercises;
                this.confidence = Math.round(result.confidence * 100);
                this.showToast(`Workout analyzed! ${this.confidence}% confidence`);
                this.isAnalyzing = false;
                loading.dismiss();
            },
            error: () => {
                this.showToast('AI analysis unavailable. Try manual entry.');
                this.isAnalyzing = false;
                loading.dismiss();
            }
        });
    }

    removeExercise(index: number) {
        this.exercises.splice(index, 1);
    }

    // ────────────────────────────────────────────────────────────────
    // MANUAL MODE
    // ────────────────────────────────────────────────────────────────

    addExerciseFromDatabase(name: string) {
        this.pushManualExercise(name);
        this.showExercisePicker = false;
        this.customExerciseName = '';
    }

    addCustomExercise() {
        const name = this.customExerciseName.trim();
        if (!name) {
            this.showToast('Please enter an exercise name');
            return;
        }
        this.pushManualExercise(name);
        this.showExercisePicker = false;
        this.customExerciseName = '';
    }

    private pushManualExercise(name: string) {
        this.manualExercises.push({ name, sets: 3, reps: 10, weight: 0, weightUnit: 'kg', rpe: 7 });
    }

    removeManualExercise(index: number) {
        this.manualExercises.splice(index, 1);
    }

    private buildExercises(list: ManualExercise[]): Exercise[] {
        return list.map((e, i) => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
            weightUnit: e.weightUnit,
            rpe: e.rpe,
            order: i + 1
        }));
    }

    async saveWorkout() {
        const user = this.authService.currentUserValue;
        if (!user) { this.showToast('You must be logged in to save a workout'); return; }

        const exercisesToSave = this.mode === 'manual'
            ? this.buildExercises(this.manualExercises)
            : this.exercises;

        if (exercisesToSave.length === 0) { this.showToast('Add at least one exercise'); return; }

        const loading = await this.loadingController.create({ message: 'Saving workout…', spinner: 'crescent' });
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
                this.showToast('Workout saved!');
                this.manualExercises = [];
                this.exercises = [];
                this.capturedImage = undefined;
                this.workoutDate = new Date().toISOString();
                this.router.navigate(['/home']);
            },
            error: () => { loading.dismiss(); this.showToast('Failed to save workout'); }
        });
    }

    // ────────────────────────────────────────────────────────────────
    // HISTORY MODE
    // ────────────────────────────────────────────────────────────────

    loadHistory() {
        const user = this.authService.currentUserValue;
        if (!user) return;
        this.isLoadingHistory = true;
        this.apiService.getWorkouts(user.id, user.tenantId).subscribe({
            next: (workouts) => {
                this.pastWorkouts = workouts.sort(
                    (a, b) => new Date(b.workoutDate).getTime() - new Date(a.workoutDate).getTime()
                );
                this.isLoadingHistory = false;
            },
            error: () => { this.isLoadingHistory = false; this.showToast('Could not load workout history'); }
        });
    }

    startEdit(workout: Workout) {
        this.editingWorkout = { ...workout };
        this.editingDate = new Date(workout.workoutDate).toISOString();
        this.editingExercises = workout.exercises.map(e => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight ?? 0,
            weightUnit: e.weightUnit ?? 'kg',
            rpe: e.rpe ?? 7
        }));
    }

    cancelEdit() {
        this.editingWorkout = null;
        this.editingExercises = [];
    }

    addExerciseToEdit() {
        this.editingExercises.push({ name: 'New Exercise', sets: 3, reps: 10, weight: 0, weightUnit: 'kg', rpe: 7 });
    }

    removeEditingExercise(index: number) {
        this.editingExercises.splice(index, 1);
    }

    async saveEditedWorkout() {
        if (!this.editingWorkout?.id) return;
        if (this.editingExercises.length === 0) { this.showToast('Add at least one exercise'); return; }

        const loading = await this.loadingController.create({ message: 'Updating workout…', spinner: 'crescent' });
        await loading.present();

        const updated: Workout = {
            ...this.editingWorkout,
            workoutDate: new Date(this.editingDate),
            exercises: this.buildExercises(this.editingExercises)
        };

        this.apiService.updateWorkout(this.editingWorkout.id, updated).subscribe({
            next: () => {
                loading.dismiss();
                this.showToast('Workout updated!');
                this.cancelEdit();
                this.loadHistory();
            },
            error: () => { loading.dismiss(); this.showToast('Failed to update workout'); }
        });
    }

    async confirmDeleteWorkout(workout: Workout) {
        const alert = await this.alertController.create({
            header: 'Delete Workout',
            message: `Delete workout from ${this.formatDate(workout.workoutDate)}?`,
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    cssClass: 'alert-button-danger',
                    handler: () => this.doDeleteWorkout(workout.id!)
                }
            ]
        });
        await alert.present();
    }

    private doDeleteWorkout(id: string) {
        this.apiService.deleteWorkout(id).subscribe({
            next: () => {
                this.showToast('Workout deleted');
                if (this.editingWorkout?.id === id) this.cancelEdit();
                this.loadHistory();
            },
            error: () => this.showToast('Failed to delete workout')
        });
    }

    // ────────────────────────────────────────────────────────────────
    // HELPERS
    // ────────────────────────────────────────────────────────────────

    formatDate(date: Date | string): string {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        });
    }

    totalVolume(workout: Workout): number {
        return workout.exercises.reduce((sum, e) => sum + e.sets * e.reps * (e.weight ?? 0), 0);
    }

    private async showToast(message: string) {
        const toast = await this.toastController.create({ message, duration: 2000, position: 'bottom' });
        await toast.present();
    }
}
