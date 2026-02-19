import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.page.html',
    styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
    notifications: any[] = [];

    constructor(private apiService: ApiService) { }

    ngOnInit() {
        // TODO: Get actual userId from auth service
        const userId = 'user1';
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
