import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false); // Default to not authenticated
  private authToken = new BehaviorSubject<string>(''); // Default to blank token

  constructor() { }

  login(): void {
    this.isAuthenticated.next(true);
  }

  logout(): void {
    this.isAuthenticated.next(false);
  }

  getAuthStatus(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  getAuthToken(): Observable<string> {
    return this.authToken.asObservable();
  }

  setAuthToken(token: string): void {
	this.authToken.next(token);
  }
}
