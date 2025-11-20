import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.page.html',
    styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
    notifications = [
        { id: 1, title: 'Workout Verified', message: 'Coach John verified your Leg Day workout.', time: new Date(Date.now() - 3600000), read: false, type: 'success' },
        { id: 2, title: 'New Message', message: 'Coach John sent you a message.', time: new Date(Date.now() - 7200000), read: true, type: 'primary' },
        { id: 3, title: 'Reminder', message: 'Don\'t forget to log your workout today!', time: new Date(Date.now() - 86400000), read: true, type: 'warning' }
    ];

    constructor() { }

    ngOnInit() {
    }

    markAsRead(id: number) {
        const notif = this.notifications.find(n => n.id === id);
        if (notif) notif.read = true;
    }
}
