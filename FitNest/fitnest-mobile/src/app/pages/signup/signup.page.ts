import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService, Tenant } from '../../services/auth.service';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.page.html',
    styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
    firstName: string = '';
    lastName: string = '';
    email: string = '';
    password: string = '';
    confirmPassword: string = '';
    role: string = 'Member';
    selectedTenantId: string = '';
    tenants: Tenant[] = [];

    constructor(
        private authService: AuthService,
        private router: Router,
        private alertController: AlertController,
        private loadingController: LoadingController
    ) { }

    async ngOnInit() {
        await this.loadTenants();
    }

    async loadTenants() {
        this.tenants = await this.authService.getTenants();
    }

    async signUp() {
        if (!this.firstName || !this.lastName || !this.email || !this.password) {
            this.showAlert('Error', 'Please fill in all required fields.');
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.showAlert('Error', 'Passwords do not match.');
            return;
        }

        if (this.password.length < 6) {
            this.showAlert('Error', 'Password must be at least 6 characters.');
            return;
        }

        if (this.role === 'Member' && !this.selectedTenantId) {
            this.showAlert('Error', 'Please select a gym to join.');
            return;
        }

        const loading = await this.loadingController.create({
            message: 'Creating account...',
        });
        await loading.present();

        try {
            const tenantId = this.role === 'Member' ? this.selectedTenantId : undefined;
            await this.authService.signUp(
                this.firstName,
                this.lastName,
                this.email,
                this.password,
                this.role,
                tenantId
            );
            await loading.dismiss();
            this.router.navigate(['/onboarding']);
        } catch (error: any) {
            await loading.dismiss();
            const message = error?.error?.message
                || error?.error?.errors?.join(', ')
                || 'Sign up failed. Please try again.';
            this.showAlert('Error', message);
        }
    }

    goToLogin() {
        this.router.navigate(['/login']);
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
