import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AiAssistantPage } from './ai-assistant.page';

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild([{ path: '', component: AiAssistantPage }])],
    declarations: [AiAssistantPage]
})
export class AiAssistantPageModule {}
