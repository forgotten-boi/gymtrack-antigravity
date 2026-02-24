import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    email = '';
    password = '';
    isLoading = false;
    errorMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) {
        if (this.authService.currentUserValue) {
            this.router.navigate(['/dashboard']);
        }
    }

    login() {
        if (!this.email || !this.password) {
            this.errorMessage = 'Please enter email and password';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        this.authService.login(this.email, this.password).subscribe({
            next: (success) => {
                this.isLoading = false;
                if (success) {
                    this.router.navigate(['/dashboard']);
                } else {
                    this.errorMessage = 'Invalid email or password';
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = 'Login failed. Please try again.';
            }
        });
    }
}
