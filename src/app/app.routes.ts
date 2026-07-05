import { Routes } from '@angular/router'
import { authGuard } from './guards/auth.guard'

// Every route is lazy-loaded so the initial bundle stays small; heavy
// pages like the World Cup dashboard (Chart.js) only download when visited.
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'project',
    loadComponent: () =>
      import('./pages/project/project.component').then((m) => m.ProjectComponent),
  },
  {
    path: 'project/:id',
    loadComponent: () =>
      import('./pages/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent
      ),
  },
  {
    path: 'world-cup',
    loadComponent: () =>
      import('./pages/world-cup/world-cup.component').then((m) => m.WorldCupComponent),
  },
  {
    path: 'stocks',
    loadComponent: () => import('./pages/stocks/stocks.component').then((m) => m.StocksComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/page-not-found/page-not-found.component').then(
        (m) => m.PageNotFoundComponent
      ),
  },
]
