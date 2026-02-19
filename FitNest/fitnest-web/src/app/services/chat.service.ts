import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

    constructor() { }

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
            // TODO: Determine if message is for this chat session (e.g. specific athlete)
            // For the coach widget, we might need to handle multiple conversations
            // For now, we'll just append to the current view if it matches

            const newMessage: ChatMessage = {
                senderId: user,
                content: message,
                timestamp: new Date(),
                isMe: false // Received messages are not from 'me'
            };

            const currentMessages = this.messagesSubject.value;
            this.messagesSubject.next([...currentMessages, newMessage]);
        });

        try {
            await this.hubConnection.start();
            console.log('SignalR Connected');
        } catch (err) {
            console.error('Error while starting SignalR connection: ' + err);
            setTimeout(() => this.startConnection(), 5000);
        }
    }

    public async sendMessage(recipientId: string, message: string) {
        if (!this.hubConnection || this.hubConnection.state !== 'Connected') {
            console.error('Cannot send message, SignalR not connected');
            return;
        }

        // Assuming backend has a method to send to a specific user
        await this.hubConnection.invoke('SendMessageToUser', recipientId, message);

        // Optimistically add to local messages
        const newMessage: ChatMessage = {
            senderId: 'me', // Placeholder
            content: message,
            timestamp: new Date(),
            isMe: true
        };

        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next([...currentMessages, newMessage]);
    }

    public stopConnection() {
        if (this.hubConnection) {
            this.hubConnection.stop();
            this.hubConnection = null;
        }
    }
}
