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
        // TODO: Get actual userId from auth service
        const userId = 'user1';
        this.apiService.getUserProfile(userId).subscribe(user => {
            this.user = user;
        });
    }

    toggleEdit() {
        this.isEditing = !this.isEditing;
        if (!this.isEditing) {
            // Reset to original if cancelled
            const userId = 'user1';
            this.apiService.getUserProfile(userId).subscribe(user => {
                this.user = user;
            });
        }
    }

    async saveProfile() {
        try {
            const userId = 'user1';
            await this.apiService.updateProfile(userId, this.user).toPromise();

            // Update local user state if needed
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
