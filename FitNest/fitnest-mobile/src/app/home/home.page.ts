import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    standalone: false,
})
export class HomePage implements OnInit {
    userName = '';
    isGuest = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        const user = this.authService.currentUserValue;
        if (!user) {
            this.router.navigate(['/login']);
            return;
        }
        this.userName = user.firstName;
        this.isGuest = this.authService.isGuest();
    }
}
