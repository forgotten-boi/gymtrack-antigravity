import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.page.html',
    styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
    messages: any[] = [];
    newMessage = '';
    currentUser: any;

    constructor(private apiService: ApiService, private authService: AuthService) { }

    ngOnInit() {
        this.currentUser = this.authService.currentUserValue;
        // In a real app, we'd connect to SignalR here
        // this.loadMessages();

        // Mock messages for now
        this.messages = [
            { senderId: 'coach', content: 'Hey! How was your workout?', timestamp: new Date(Date.now() - 3600000), isMe: false },
            { senderId: this.currentUser?.id, content: 'It was great! Hit a PR on squats.', timestamp: new Date(Date.now() - 1800000), isMe: true },
            { senderId: 'coach', content: 'Awesome! Keep it up.', timestamp: new Date(Date.now() - 900000), isMe: false }
        ];
    }

    sendMessage() {
        if (!this.newMessage.trim()) return;

        const message = {
            senderId: this.currentUser?.id,
            content: this.newMessage,
            timestamp: new Date(),
            isMe: true
        };

        this.messages.push(message);
        this.newMessage = '';

        // TODO: Send to backend via API/SignalR
    }
}
