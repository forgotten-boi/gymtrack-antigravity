import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  @Input() athleteId: string = '';
  @Input() athleteName: string = 'Athlete';

  isOpen = false;
  newMessage = '';
  messages: any[] = [];

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.chatService.messages$.subscribe(messages => {
      // Filter messages for the current athlete if needed
      // For now, we'll just show all messages from the service
      // In a real app, you'd filter by conversation ID or sender/recipient
      this.messages = messages;
    });

    this.chatService.startConnection();
  }

  ngOnDestroy() {
    this.chatService.stopConnection();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.athleteId) return;

    await this.chatService.sendMessage(this.athleteId, this.newMessage);
    this.newMessage = '';
  }
}
