import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage {
    email: string = '';
    password: string = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private alertController: AlertController,
        private loadingController: LoadingController
    ) { }

    async loginWithEmail() {
        if (!this.email || !this.password) {
            this.showAlert('Error', 'Please enter email and password');
            return;
        }

        const loading = await this.loadingController.create({
            message: 'Logging in...',
        });
        await loading.present();

        try {
            const success = await this.authService.loginWithEmail(this.email, this.password);
            await loading.dismiss();

            if (success) {
                this.router.navigate(['/home']);
            } else {
                this.showAlert('Error', 'Invalid credentials');
            }
        } catch (error) {
            await loading.dismiss();
            this.showAlert('Error', 'Login failed. Please try again.');
        }
    }

    async loginWithGoogle() {
        const loading = await this.loadingController.create({
            message: 'Signing in with Google...',
        });
        await loading.present();

        try {
            const success = await this.authService.loginWithGoogle();
            await loading.dismiss();

            if (success) {
                this.router.navigate(['/home']);
            } else {
                this.showAlert('Error', 'Google sign-in failed');
            }
        } catch (error) {
            await loading.dismiss();
            this.showAlert('Error', 'Google sign-in failed. Please try again.');
        }
    }

    loginAsGuest() {
        this.authService.loginAsGuest();
        this.router.navigate(['/home']);
    }

    private async showAlert(header: string, message: string) {
        const alert = await this.alertController.create({
            header,
            message,
            buttons: ['OK'],
        });
        await alert.present();
    }
}
