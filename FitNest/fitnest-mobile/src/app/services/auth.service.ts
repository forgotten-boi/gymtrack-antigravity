import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
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

    constructor() {
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
        try {
            // TODO: Implement ASP.NET Identity login
            // For now, mock implementation
            const mockUser: User = {
                id: '1',
                email: email,
                firstName: 'Test',
                lastName: 'User',
                tenantId: '1',
                role: 'Member'
            };

            localStorage.setItem('currentUser', JSON.stringify(mockUser));
            localStorage.setItem('auth_token', 'mock-token');
            this.currentUserSubject.next(mockUser);

            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    async loginWithGoogle(): Promise<boolean> {
        try {
            // TODO: Implement Firebase Google Sign-In
            // For now, mock implementation
            const mockUser: User = {
                id: '1',
                email: 'google@example.com',
                firstName: 'Google',
                lastName: 'User',
                tenantId: '1',
                role: 'Member'
            };

            localStorage.setItem('currentUser', JSON.stringify(mockUser));
            localStorage.setItem('auth_token', 'mock-token');
            this.currentUserSubject.next(mockUser);

            return true;
        } catch (error) {
            console.error('Google login error:', error);
            return false;
        }
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('auth_token');
        this.currentUserSubject.next(null);
    }

    isAuthenticated(): boolean {
        return this.currentUserValue !== null;
    }
}
