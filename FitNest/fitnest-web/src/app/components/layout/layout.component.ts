import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
    isSidebarCollapsed = false;
    showNotifications = false;
    notificationCount = 5;

    notifications = [
        { message: 'Sarah Conner submitted a new workout', time: '2 min ago', read: false, icon: 'dumbbell' },
        { message: 'Mike Ross hit a new PR on Deadlift', time: '15 min ago', read: false, icon: 'trophy' },
        { message: 'Rachel Zane completed her weekly goal', time: '1 hr ago', read: false, icon: 'target' },
        { message: 'New athlete John Doe joined your team', time: '3 hrs ago', read: true, icon: 'user-plus' },
        { message: 'Weekly report is ready to review', time: '5 hrs ago', read: true, icon: 'file-text' },
    ];

    navItems = [
        { path: '/dashboard', icon: 'grid', label: 'Dashboard' },
        { path: '/athletes', icon: 'users', label: 'Athletes' },
    ];

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    get currentUser() {
        return this.authService.currentUserValue;
    }

    get unreadCount(): number {
        return this.notifications.filter(n => !n.read).length;
    }

    toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    toggleNotifications() {
        this.showNotifications = !this.showNotifications;
    }

    markAsRead(index: number) {
        this.notifications[index].read = true;
    }

    markAllRead() {
        this.notifications.forEach(n => n.read = true);
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
