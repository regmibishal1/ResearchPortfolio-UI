import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

	isLoginDivVisible: boolean  = true;

	registerObj: RegisterModel  = new RegisterModel();
	loginObj: LoginModel  = new LoginModel();

	constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

	onRegister() {
		this.http.post<AuthResponse>('http://localhost:8080/api/v1/auth/register', this.registerObj).subscribe((response: AuthResponse) => {
			this.authService.setAuthToken(response.access_token);
			this.router.navigate(['/']);
		});
		this.authService.login();
	}

	onLogin() {
		this.http.post<AuthResponse>('http://localhost:8080/api/v1/auth/authenticate', this.loginObj).subscribe((response: AuthResponse) => {
			this.authService.setAuthToken(response.access_token);
			this.router.navigate(['/']);
		});
		this.authService.login();
	}

	onLogout() {
		this.http.post('http://localhost:8080/api/v1/auth/logout', {}).subscribe((response) => {
			console.log(response);
		});
		console.log('Logout');
		alert('Logout Success');
		this.authService.logout();
	}

}

export class AuthResponse  {
	access_token: string;
	refresh_token: string;

	constructor() {
		this.access_token = "";
		this.refresh_token = "";
	}

}

export class RegisterModel  {
	firstname: string;
	lastname: string;
	email: string;
	username: string;
	password: string;

	constructor() {
		this.firstname = "";
		this.lastname = "";
		this.email = "";
		this.username = "";
		this.password= "";
	}
}

export class LoginModel  {
	username: string;
	password: string;

	constructor() {
		this.username = "";
		this.password = "";
	}

}
