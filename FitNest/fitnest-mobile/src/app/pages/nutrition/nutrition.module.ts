import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NutritionPage } from './nutrition.page';
import { SharedComponentsModule } from '../../components/shared-components.module';

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild([{ path: '', component: NutritionPage }]), SharedComponentsModule],
    declarations: [NutritionPage]
})
export class NutritionPageModule {}
