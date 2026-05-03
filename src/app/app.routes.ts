import { Routes } from '@angular/router'
import { AboutComponent } from './pages/about/about.component'
import { DashboardComponent } from './pages/dashboard/dashboard.component'
import { AuthComponent } from './pages/auth/auth.component'
import { ProjectComponent } from './pages/project/project.component'
import { ProjectDetailComponent } from './pages/project-detail/project-detail.component'
import { ProfileComponent } from './pages/profile/profile.component'
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component'
import { authGuard } from './guards/auth.guard'

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: DashboardComponent },
  { path: 'about', component: AboutComponent },
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  { path: 'project', component: ProjectComponent },
  { path: 'project/:id', component: ProjectDetailComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', component: PageNotFoundComponent },
]
