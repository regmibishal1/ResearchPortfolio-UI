import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private isAuthenticated = new BehaviorSubject<boolean>(false); // Default to not authenticated
	private authToken = new BehaviorSubject<string>(''); // Default to blank token
	private refreshToken = new BehaviorSubject<string>(''); // Default to blank token
	private apiURL: string = 'http://localhost:8080/api/v1/auth';


	constructor(private http: HttpClient) {}

	getAuthStatus(): Observable<boolean> {
		return this.isAuthenticated.asObservable();
	}

	getAuthToken(): Observable<string> {
		return this.authToken.asObservable();
	}

	register(data: RegisterModel) {
		return this.http
			.post<AuthResponse>(this.apiURL + '/register', data)
			.pipe(
				tap((response: AuthResponse) => {
					this.authToken.next(response.access_token);
					this.refreshToken.next(response.refresh_token);
					this.isAuthenticated.next(true);
				}),
				catchError(this.handleError)
			);
	}

	login(data: LoginModel) {
		return this.http
			.post<AuthResponse>(this.apiURL + '/authenticate', data)
			.pipe(
				tap((response: AuthResponse) => {
					this.authToken.next(response.access_token);
					this.refreshToken.next(response.refresh_token);
					this.isAuthenticated.next(true);
				}),
				catchError(this.handleError)
			);
	}

	logout() {
		return this.http
			.post<AuthResponse>(this.apiURL + '/logout', {})
			.pipe(
				tap(() => {
					this.isAuthenticated.next(false);
				}),
				catchError(this.handleError)
			);
	}

	private handleError(error: HttpErrorResponse) {
		let errorMessage = "An unknown error occurred.";
		if (error.error instanceof ErrorEvent) {
			// A client-side or network error occurred. Handle it accordingly.
			errorMessage = `Unhandled error: ${error.error.message}`;
			console.error(errorMessage);
		} else {
			if (error.status === 401) {
				// Unauthorized
				errorMessage = 'Invalid username or password.';
			} else if (error.status === 403) {
				// Forbidden
				errorMessage = 'Access denied.';
			} else {
				// The backend returned an unsuccessful response code.
				// The response body may contain clues as to what went wrong.
				errorMessage = `Error Status ${error.status} - ${error.error.message}`;
				console.error(errorMessage);
			}
		}
		// Return an observable with a user-facing error message
		return throwError(
			() => new Error(errorMessage)
		);
	}
}

export class AuthResponse {
	access_token: string;
	refresh_token: string;

	constructor() {
		this.access_token = '';
		this.refresh_token = '';
	}
}

export class RegisterModel {
	firstname: string;
	lastname: string;
	email: string;
	username: string;
	password: string;

	constructor() {
		this.firstname = '';
		this.lastname = '';
		this.email = '';
		this.username = '';
		this.password = '';
	}
}

export class LoginModel {
	username: string;
	password: string;

	constructor() {
		this.username = '';
		this.password = '';
	}
}
