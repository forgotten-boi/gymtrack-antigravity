import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent implements OnInit {
  @Input() athleteId: string = '';
  @Input() athleteName: string = 'Athlete';

  isOpen = false;
  newMessage = '';
  messages: any[] = [];

  constructor() { }

  ngOnInit(): void {
    // Mock messages
    this.messages = [
      { sender: 'athlete', content: 'Hi Coach, I finished my workout.', time: new Date(Date.now() - 3600000) },
      { sender: 'coach', content: 'Great job! How did the squats feel?', time: new Date(Date.now() - 1800000) }
    ];
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    this.messages.push({
      sender: 'coach',
      content: this.newMessage,
      time: new Date()
    });
    this.newMessage = '';
  }
}
