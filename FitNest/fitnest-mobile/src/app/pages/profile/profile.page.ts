import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
    user: any = {};
    isEditing = false;
    isGuest = false;

    constructor(
        private authService: AuthService,
        private apiService: ApiService,
        private toastController: ToastController,
        private router: Router
    ) { }

    ngOnInit() {
        const currentUser = this.authService.currentUserValue;
        const userId = currentUser?.id || '1';
        this.isGuest = this.authService.isGuest();

        this.apiService.getUserProfile(userId).subscribe(user => {
            this.user = user;
        });
    }

    toggleEdit() {
        this.isEditing = !this.isEditing;
        if (!this.isEditing) {
            const currentUser = this.authService.currentUserValue;
            const userId = currentUser?.id || '1';
            this.apiService.getUserProfile(userId).subscribe(user => {
                this.user = user;
            });
        }
    }

    async saveProfile() {
        try {
            const currentUser = this.authService.currentUserValue;
            const userId = currentUser?.id || '1';
            await this.apiService.updateProfile(userId, this.user).toPromise();
            this.isEditing = false;
            this.showToast('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showToast('Failed to update profile');
        }
    }

    async showToast(message: string) {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            position: 'bottom'
        });
        await toast.present();
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
