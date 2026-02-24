import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    role: string;
    isGuest?: boolean;
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

    async loginWithEmail(email: string, password: string): Promise<boolean> {
        if (environment.useMocks) {
            return this.mockEmailLogin(email, password);
        }

        try {
            const response = await this.http.post<AuthResponse>(
                `${environment.apiUrl}/api/auth/login`,
                { email, password }
            ).toPromise();

            if (response) {
                const user: User = {
                    id: response.id,
                    email: response.email,
                    firstName: response.firstName,
                    lastName: response.lastName,
                    tenantId: response.tenantId,
                    role: response.role,
                    isGuest: false
                };

                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('auth_token', response.token);
                this.currentUserSubject.next(user);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    private async mockEmailLogin(email: string, password: string): Promise<boolean> {
        const mockUser: User = {
            id: '1',
            email: email,
            firstName: 'Test',
            lastName: 'User',
            tenantId: '1',
            role: 'Member',
            isGuest: false
        };

        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        localStorage.setItem('auth_token', 'mock-token');
        this.currentUserSubject.next(mockUser);
        return true;
    }

    async loginWithGoogle(): Promise<boolean> {
        const mockUser: User = {
            id: '1',
            email: 'google@example.com',
            firstName: 'Google',
            lastName: 'User',
            tenantId: '1',
            role: 'Member',
            isGuest: false
        };

        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        localStorage.setItem('auth_token', 'mock-token');
        this.currentUserSubject.next(mockUser);
        return true;
    }

    loginAsGuest(): void {
        const guestUser: User = {
            id: 'guest-' + Date.now(),
            email: 'guest@local',
            firstName: 'Guest',
            lastName: 'User',
            tenantId: 'local',
            role: 'Member',
            isGuest: true
        };

        localStorage.setItem('currentUser', JSON.stringify(guestUser));
        localStorage.removeItem('auth_token');
        this.currentUserSubject.next(guestUser);
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('auth_token');
        this.currentUserSubject.next(null);
    }

    isAuthenticated(): boolean {
        return this.currentUserValue !== null;
    }

    isGuest(): boolean {
        return this.currentUserValue?.isGuest === true;
    }
}
