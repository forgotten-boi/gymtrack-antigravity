import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { ApiService } from './services/api.service';
import { MockApiService } from './services/mock-api.service';
import { RealApiService } from './services/real-api.service';
import { environment } from '../environments/environment';

export function apiServiceFactory(http: HttpClient) {
  if (environment.useMocks) {
    return new MockApiService();
  } else {
    return new RealApiService(http);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: ApiService,
      useFactory: apiServiceFactory,
      deps: [HttpClient]
    }
  ]
};
