import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WorkoutCapturePage } from './workout-capture.page';
import { RouterModule, Routes } from '@angular/router';
import { SharedComponentsModule } from '../../components/shared-components.module';

const routes: Routes = [
    {
        path: '',
        component: WorkoutCapturePage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        SharedComponentsModule
    ],
    declarations: [WorkoutCapturePage]
})
export class WorkoutCapturePageModule { }
