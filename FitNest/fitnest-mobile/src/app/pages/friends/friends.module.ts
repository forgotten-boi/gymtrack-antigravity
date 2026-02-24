import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FriendsPage } from './friends.page';

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild([{ path: '', component: FriendsPage }])],
    declarations: [FriendsPage]
})
export class FriendsPageModule {}
