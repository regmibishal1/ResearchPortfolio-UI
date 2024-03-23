import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
	AuthService,
	RegisterModel,
	LoginModel,
} from './auth.service';
import { FormsModule } from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
	selector: 'app-auth',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './auth.component.html',
	styleUrl: './auth.component.scss',
})
export class AuthComponent {
	isLoginDivVisible: boolean = true;
	registerObj: RegisterModel = new RegisterModel();
	loginObj: LoginModel = new LoginModel();

	constructor(private router: Router, private authService: AuthService, private _snackBar: MatSnackBar) {}

	onRegister() {
		this.authService.register(this.registerObj).subscribe({
			next: () => {
				this.openSnackBar('Registration successful!');
				this.router.navigate(['/']);
			},
			error: (error: Error) => {
				this.openSnackBar(error.message);
			},
		});
	}

	onLogin() {
		this.authService.login(this.loginObj).subscribe({
			next: () => {
				this.openSnackBar('Login successful!');
				this.router.navigate(['/']);
			},
			error: (error: Error) => {
				this.openSnackBar(error.message);
			},
		});
	}

	onLogout() {
		this.authService.logout();
	}

	openSnackBar(message: string) {
		this._snackBar.open(message, 'Close', {
			duration: 5000,
		});
	}

}
