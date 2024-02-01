import { Routes } from '@angular/router';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { AboutComponent } from './Pages/about/about.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: 'home', component: DashboardComponent },
	{ path: 'about', component: AboutComponent }
];
