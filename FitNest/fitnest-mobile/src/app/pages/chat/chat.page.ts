import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.page.html',
    styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
    messages: any[] = [];
    newMessage = '';
    currentUser: any;

    constructor(
        private apiService: ApiService,
        private authService: AuthService,
        private chatService: ChatService
    ) { }

    ngOnInit() {
        this.currentUser = this.authService.currentUserValue;

        this.chatService.messages$.subscribe(messages => {
            this.messages = messages;
        });

        this.chatService.startConnection();
    }

    ngOnDestroy() {
        this.chatService.stopConnection();
    }

    async sendMessage() {
        if (!this.newMessage.trim()) return;

        await this.chatService.sendMessage(this.newMessage);
        this.newMessage = '';
    }
}
