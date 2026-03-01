import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.page.html',
    styleUrls: ['./notifications.page.scss'],
    standalone: false
})
export class NotificationsPage implements OnInit {
    notifications: any[] = [];

    constructor(
        private apiService: ApiService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        const user = this.authService.currentUserValue;
        const userId = user?.id || '1';
        this.apiService.getNotifications(userId).subscribe(notifications => {
            this.notifications = notifications;
        });
    }

    markAsRead(id: number) {
        this.apiService.markNotificationAsRead(id).subscribe(() => {
            const notif = this.notifications.find(n => n.id === id);
            if (notif) notif.read = true;
        });
    }
}
