import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Pages/auth/auth.service';
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

	constructor(private authService: AuthService) {}

	ngOnInit() {
		this.authSubscription = this.authService.getAuthStatus().subscribe(
		(isAuth) => {
			this.isAuthenticated = isAuth;
		}
		);
	}

	ngOnDestroy() {
		if (this.authSubscription) {
		this.authSubscription.unsubscribe();
		}
	}
	}
