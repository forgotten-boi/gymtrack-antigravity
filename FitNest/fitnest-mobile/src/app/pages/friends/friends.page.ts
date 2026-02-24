import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { ApiService, Friend, LeaderboardEntry, ActivityFeedItem } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-friends',
    templateUrl: './friends.page.html',
    styleUrls: ['./friends.page.scss'],
    standalone: false
})
export class FriendsPage implements OnInit {
    selectedTab = 'leaderboard';
    leaderboard: LeaderboardEntry[] = [];
    feed: ActivityFeedItem[] = [];
    friends: Friend[] = [];
    suggestedFriends: Friend[] = [];
    isGuest = false;

    constructor(
        private apiService: ApiService,
        private authService: AuthService,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController
    ) {}

    ngOnInit() {
        const user = this.authService.currentUserValue;
        this.isGuest = user?.isGuest || false;
        this.loadData();
    }

    loadData() {
        const user = this.authService.currentUserValue;
        const userId = user?.id || '1';

        this.apiService.getLeaderboard(userId).subscribe(data => this.leaderboard = data);
        this.apiService.getActivityFeed(userId).subscribe(data => this.feed = data);
        this.apiService.getFriends(userId).subscribe(data => this.friends = data);
        this.apiService.getSuggestedFriends(userId).subscribe(data => this.suggestedFriends = data);
    }

    async addFriend(friendId: string) {
        const user = this.authService.currentUserValue;
        const userId = user?.id || '1';

        this.apiService.addFriend(userId, friendId).subscribe(async () => {
            const toast = await this.toastCtrl.create({ message: 'Friend added!', duration: 1500, color: 'success' });
            await toast.present();
            this.loadData();
        });
    }

    async removeFriend(friend: Friend) {
        const alert = await this.alertCtrl.create({
            header: 'Remove Friend',
            message: `Remove ${friend.firstName} ${friend.lastName}?`,
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Remove', role: 'destructive',
                    handler: () => {
                        const user = this.authService.currentUserValue;
                        this.apiService.removeFriend(user?.id || '1', friend.id).subscribe(() => this.loadData());
                    }
                }
            ]
        });
        await alert.present();
    }

    getActivityIcon(type: string): string {
        switch (type) {
            case 'workout': return 'barbell-outline';
            case 'pr': return 'trophy-outline';
            case 'streak': return 'flame-outline';
            default: return 'fitness-outline';
        }
    }

    getActivityColor(type: string): string {
        switch (type) {
            case 'workout': return 'primary';
            case 'pr': return 'warning';
            case 'streak': return 'success';
            default: return 'medium';
        }
    }

    getRankIcon(rank: number): string {
        switch (rank) {
            case 1: return 'trophy';
            case 2: return 'medal-outline';
            case 3: return 'medal-outline';
            default: return '';
        }
    }

    getRankColor(rank: number): string {
        switch (rank) {
            case 1: return '#FFD700';
            case 2: return '#C0C0C0';
            case 3: return '#CD7F32';
            default: return '#a0aec0';
        }
    }

    timeAgo(date: Date): string {
        const now = new Date().getTime();
        const then = new Date(date).getTime();
        const diff = now - then;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    getInitials(firstName: string, lastName: string): string {
        return (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '');
    }
}
