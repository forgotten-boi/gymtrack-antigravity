import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { ApiService } from './services/api.service';
import { MockApiService } from './services/mock-api.service';
import { RealApiService } from './services/real-api.service';
import { GuestApiService } from './services/guest-api.service';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';

export function apiServiceFactory(http: HttpClient, authService: AuthService) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.isGuest) {
            return new GuestApiService();
        }
    }

    if (environment.useMocks) {
        return new MockApiService();
    } else {
        return new RealApiService(http);
    }
}

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        {
            provide: ApiService,
            useFactory: apiServiceFactory,
            deps: [HttpClient, AuthService]
        }
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
