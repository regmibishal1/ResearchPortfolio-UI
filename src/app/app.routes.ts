import { Routes } from '@angular/router';
import { AboutComponent } from './Pages/about/about.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { AuthComponent } from './Pages/auth/auth.component';
import { PageNotFoundComponent } from './Pages/page-not-found/page-not-found.component';


export const routes: Routes = [
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: 'home', component: DashboardComponent },
	{ path: 'about', component: AboutComponent },
	{ path: 'login', component:  AuthComponent},
	{ path: 'register', component:  AuthComponent},
	{ path: '**', component: PageNotFoundComponent}

];
