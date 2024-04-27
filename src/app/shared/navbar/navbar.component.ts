import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../pages/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-navbar',
	standalone: true,
	imports: [
		CommonModule,
		MatToolbarModule,
		MatButtonModule,
		MatIconModule,
		MatSidenavModule,
		RouterModule
	],
	templateUrl: './navbar.component.html',
	styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
	isAuthenticated = false;
	private authSubscription!: Subscription;

	constructor(private authService: AuthService, private _snackBar: MatSnackBar) {}

	ngOnInit() {
		this.authSubscription = this.authService.getAuthStatus().subscribe(
		(isAuth) => {
			this.isAuthenticated = isAuth;
		}
		);
	}

	onLogout() {
		this.authService.logout().subscribe({
			next: () => {
				this.openSnackBar('Logged out successfully!');
			},
			error: (error: Error) => {
				this.openSnackBar(error.message);
			},
		});
	}


	ngOnDestroy() {
		if (this.authSubscription) {
		this.authSubscription.unsubscribe();
		}
	}

	openSnackBar(message: string) {
		this._snackBar.open(message, 'Close', {
			duration: 5000,
		});
	}
}
