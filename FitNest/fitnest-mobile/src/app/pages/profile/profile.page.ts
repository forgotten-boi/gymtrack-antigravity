import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
    user: any = {};
    isEditing = false;

    constructor(
        private authService: AuthService,
        private apiService: ApiService,
        private toastController: ToastController
    ) { }

    ngOnInit() {
        this.user = { ...this.authService.currentUserValue };
    }

    toggleEdit() {
        this.isEditing = !this.isEditing;
        if (!this.isEditing) {
            // Reset to original if cancelled
            this.user = { ...this.authService.currentUserValue };
        }
    }

    async saveProfile() {
        try {
            // TODO: Call API to update profile
            // await this.apiService.updateProfile(this.user).toPromise();

            // Mock success
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update local user state
            // this.authService.updateUser(this.user);

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
    }
}
