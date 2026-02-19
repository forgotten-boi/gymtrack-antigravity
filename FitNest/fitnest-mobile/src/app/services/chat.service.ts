import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ChatMessage {
    senderId: string;
    content: string;
    timestamp: Date;
    isMe: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private hubConnection: HubConnection | null = null;
    private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
    public messages$ = this.messagesSubject.asObservable();

    constructor(private authService: AuthService) { }

    public async startConnection() {
        if (this.hubConnection && this.hubConnection.state === 'Connected') {
            return;
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('No auth token found, cannot connect to chat');
            return;
        }

        this.hubConnection = new HubConnectionBuilder()
            .withUrl(`${environment.apiUrl}/chatHub`, {
                accessTokenFactory: () => token
            })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
            const currentUser = this.authService.currentUserValue;
            const isMe = user === currentUser?.id;

            const newMessage: ChatMessage = {
                senderId: user,
                content: message,
                timestamp: new Date(),
                isMe: isMe
            };

            const currentMessages = this.messagesSubject.value;
            this.messagesSubject.next([...currentMessages, newMessage]);
        });

        try {
            await this.hubConnection.start();
            console.log('SignalR Connected');

            // Join a group based on userId or tenantId if needed
            // await this.hubConnection.invoke('JoinGroup', 'some-group-id');
        } catch (err) {
            console.error('Error while starting SignalR connection: ' + err);
            setTimeout(() => this.startConnection(), 5000);
        }
    }

    public async sendMessage(message: string) {
        if (!this.hubConnection || this.hubConnection.state !== 'Connected') {
            console.error('Cannot send message, SignalR not connected');
            return;
        }

        const currentUser = this.authService.currentUserValue;
        // Assuming the backend expects 'user' and 'message' arguments
        // You might need to adjust this based on your backend Hub implementation
        // For a 1-on-1 chat, you'd typically send to a specific user or group
        // For now, we'll assume a broadcast or a specific method for sending to coach

        // Example: Send to a specific user (coach)
        // await this.hubConnection.invoke('SendMessageToUser', 'coachId', message);

        // For this demo, let's assume a simple broadcast or echo
        await this.hubConnection.invoke('SendMessage', currentUser?.id, message);
    }

    public stopConnection() {
        if (this.hubConnection) {
            this.hubConnection.stop();
            this.hubConnection = null;
        }
    }
}
