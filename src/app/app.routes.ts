import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from './core/guards';
import { UserRole } from './core/enums/user-role.enum';

export const routes: Routes = [
  // Routes publiques avec layout principal
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent),
        title: 'Cinephoria - Accueil'
      },
      {
        path: 'movies',
        loadComponent: () => import('./features/public/movies/movies/movies.component').then(m => m.MoviesComponent),
        title: 'Cinephoria - Films'
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent),
        title: 'Cinephoria - Contact'
      }
    ]
  },

  // Routes d'authentification avec layout auth
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login/login.component').then(m => m.LoginComponent),
        title: 'Cinephoria - Connexion'
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/login/login/login.component').then(m => m.LoginComponent),
        title: 'Cinephoria - Inscription'
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Routes utilisateur avec layout principal (protégées)
  {
    path: 'user',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/user/dashboard/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
        title: 'Cinephoria - Mon Espace'
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent),
        title: 'Cinephoria - Mes Réservations'
      },
      {
        path: 'reviews',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent),
        title: 'Cinephoria - Mes Avis'
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent),
        title: 'Cinephoria - Mon Profil'
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Routes employé avec layout admin (protégées)
  {
    path: 'employee',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.Employee, UserRole.Admin] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/management/dashboard/management-dashboard/management-dashboard.component').then(m => m.ManagementDashboardComponent),
        title: 'Cinephoria - Tableau de Bord Employé'
      },
      {
        path: 'movies',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent), // Temporaire
        title: 'Cinephoria - Gestion Films'
      },
      {
        path: 'showtimes',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent), // Temporaire
        title: 'Cinephoria - Gestion Séances'
      },
      {
        path: 'theaters',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent), // Temporaire
        title: 'Cinephoria - Gestion Salles'
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent), // Temporaire
        title: 'Cinephoria - Validation Réservations'
      },
      {
        path: 'checkin',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent), // Temporaire
        title: 'Cinephoria - Check-in Clients'
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Routes admin avec layout admin (protégées)
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.Admin] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/management/dashboard/management-dashboard/management-dashboard.component').then(m => m.ManagementDashboardComponent),
        title: 'Cinephoria - Tableau de Bord Admin'
      },
      {
        path: 'movies',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent), // Temporaire
        title: 'Cinephoria - Gestion Films'
      },
      {
        path: 'showtimes',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent), // Temporaire
        title: 'Cinephoria - Gestion Séances'
      },
      {
        path: 'theaters',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent), // Temporaire
        title: 'Cinephoria - Gestion Salles'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent), // Temporaire
        title: 'Cinephoria - Gestion Utilisateurs'
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent), // Temporaire
        title: 'Cinephoria - Gestion Employés'
      },
      {
        path: 'statistics',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent), // Temporaire
        title: 'Cinephoria - Statistiques'
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent), // Temporaire
        title: 'Cinephoria - Paramètres'
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Route 404
  {
    path: '**',
    loadComponent: () => import('./features/public/not-found/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Cinephoria - Page Non Trouvée'
  }
];