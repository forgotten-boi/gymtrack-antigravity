import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { ApiService } from './services/api.service';
import { ApiServiceRouter } from './services/api-router.service';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        // ApiServiceRouter dynamically delegates to Mock / Guest / Real
        // based on current auth state, so guest mode always uses localStorage
        // and mock data is only returned when useMocks=true.
        { provide: ApiService, useExisting: ApiServiceRouter }
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
