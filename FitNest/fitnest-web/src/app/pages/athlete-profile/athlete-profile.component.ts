import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatWidgetComponent } from '../../components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-athlete-profile',
  standalone: true,
  imports: [CommonModule, ChatWidgetComponent],
  templateUrl: './athlete-profile.component.html',
  styleUrls: ['./athlete-profile.component.css']
})
export class AthleteProfileComponent {
  athlete = {
    id: '1',
    name: 'Sarah Conner',
    email: 'sarah@example.com',
    joinDate: new Date('2024-01-15'),
    status: 'Active',
    goals: ['Increase Squat PR', 'Improve Mobility'],
    recentWorkouts: [
      { date: new Date(Date.now() - 86400000), name: 'Leg Day', status: 'Completed' },
      { date: new Date(Date.now() - 172800000), name: 'Upper Body', status: 'Completed' },
      { date: new Date(Date.now() - 259200000), name: 'Cardio', status: 'Skipped' }
    ]
  };
}
