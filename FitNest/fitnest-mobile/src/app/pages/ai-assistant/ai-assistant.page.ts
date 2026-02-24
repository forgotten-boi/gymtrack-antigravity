import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ApiService, AiChatMessage } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-ai-assistant',
    templateUrl: './ai-assistant.page.html',
    styleUrls: ['./ai-assistant.page.scss'],
    standalone: false
})
export class AiAssistantPage implements OnInit {
    @ViewChild(IonContent) content!: IonContent;

    messages: AiChatMessage[] = [];
    inputMessage = '';
    isLoading = false;
    isGuest = false;

    quickActions = [
        { label: 'Workout Plan', icon: 'barbell-outline', message: 'Suggest a workout plan for this week' },
        { label: 'Calorie Target', icon: 'flame-outline', message: 'What should my calorie intake be?' },
        { label: 'My Progress', icon: 'trending-up-outline', message: 'How am I doing this month?' },
        { label: 'Form Tips', icon: 'body-outline', message: 'Give me tips for proper squat form' }
    ];

    constructor(private apiService: ApiService, private authService: AuthService) {}

    ngOnInit() {
        const user = this.authService.currentUserValue;
        this.isGuest = user?.isGuest || false;
        const userId = user?.id || '1';

        this.apiService.getChatHistory(userId).subscribe(history => {
            this.messages = history;
            setTimeout(() => this.scrollToBottom(), 100);
        });
    }

    sendMessage(text?: string) {
        const message = text || this.inputMessage.trim();
        if (!message) return;

        const user = this.authService.currentUserValue;
        const userId = user?.id || '1';

        this.messages.push({ role: 'user', content: message, timestamp: new Date() });
        this.inputMessage = '';
        this.isLoading = true;
        this.scrollToBottom();

        this.apiService.sendAiMessage(message, userId).subscribe({
            next: (reply) => {
                this.messages.push(reply);
                this.isLoading = false;
                this.scrollToBottom();
            },
            error: () => {
                this.messages.push({ role: 'assistant', content: 'Sorry, something went wrong. Please try again.', responseType: 'text', timestamp: new Date() });
                this.isLoading = false;
                this.scrollToBottom();
            }
        });
    }

    sendQuickAction(message: string) {
        this.sendMessage(message);
    }

    scrollToBottom() {
        setTimeout(() => this.content?.scrollToBottom(300), 100);
    }

    isWorkoutPlan(msg: AiChatMessage): boolean {
        return msg.responseType === 'workout_plan';
    }

    isCalorieCard(msg: AiChatMessage): boolean {
        return msg.responseType === 'calorie_card';
    }

    isProgressCard(msg: AiChatMessage): boolean {
        return msg.responseType === 'progress_card';
    }

    parseJson(content: string): any {
        try { return JSON.parse(content); }
        catch { return null; }
    }
}
