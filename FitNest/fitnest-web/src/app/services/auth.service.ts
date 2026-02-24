import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    role: string;
}

interface AuthResponse {
    token: string;
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject: BehaviorSubject<User | null>;
    public currentUser: Observable<User | null>;

    constructor(private http: HttpClient) {
        const storedUser = localStorage.getItem('currentUser');
        this.currentUserSubject = new BehaviorSubject<User | null>(
            storedUser ? JSON.parse(storedUser) : null
        );
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string): Observable<boolean> {
        if (environment.useMocks) {
            return this.mockLogin(email, password);
        }

        return this.http.post<AuthResponse>(`${environment.apiUrl}/api/auth/login`, { email, password }).pipe(
            map(response => {
                const user: User = {
                    id: response.id,
                    email: response.email,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    tenantId: response.tenantId,
                    role: response.role
                };
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('auth_token', response.token);
                this.currentUserSubject.next(user);
                return true;
            }),
            catchError(() => of(false))
        );
    }

    private mockLogin(email: string, password: string): Observable<boolean> {
        return new Observable<boolean>(observer => {
            setTimeout(() => {
                if (email === 'coach@fitnest.com' && password === 'password') {
                    const user: User = {
                        id: '1',
                        email: email,
                        firstName: 'Coach',
                        lastName: 'Mike',
                        tenantId: '1',
                        role: 'Coach'
                    };
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('auth_token', 'mock-token');
                    this.currentUserSubject.next(user);
                    observer.next(true);
                } else {
                    observer.next(false);
                }
                observer.complete();
            }, 500);
        });
    }

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('auth_token');
        this.currentUserSubject.next(null);
    }
}
