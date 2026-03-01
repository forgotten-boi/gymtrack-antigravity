import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfilePage } from './profile.page';
import { RouterModule } from '@angular/router';
import { SharedComponentsModule } from '../../components/shared-components.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild([{ path: '', component: ProfilePage }]),
        SharedComponentsModule
    ],
    declarations: [ProfilePage]
})
export class ProfilePageModule { }
