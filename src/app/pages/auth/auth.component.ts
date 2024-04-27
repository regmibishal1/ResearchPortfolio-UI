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
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { finalize } from 'rxjs/operators';

@Component({
	selector: 'app-auth',
	standalone: true,
	imports: [CommonModule, FormsModule, MatProgressBarModule],
	templateUrl: './auth.component.html',
	styleUrl: './auth.component.scss',
})
export class AuthComponent {
	isLoginDivVisible: boolean = true;
	registerObj: RegisterModel = new RegisterModel();
	loginObj: LoginModel = new LoginModel();
	isLoading: boolean = false;

	constructor(private router: Router, private authService: AuthService, private _snackBar: MatSnackBar) {}

	onRegister() {
		this.isLoading = true;
		this.authService.register(this.registerObj).pipe(
			finalize(() => this.isLoading = false)
			).subscribe({
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
		this.isLoading = true;
		this.authService.login(this.loginObj).pipe(
			finalize(() => this.isLoading = false)
			).subscribe({
			next: () => {
				this.openSnackBar('Login successful!');
				this.router.navigate(['/']);
			},
			error: (error: Error) => {
				this.openSnackBar(error.message);
			},
		});
	}

	openSnackBar(message: string) {
		this._snackBar.open(message, 'Close', {
			duration: 5000,
		});
	}

}
