import { Routes } from '@angular/router';
import { UserRole } from './core/enums/user-role.enum';
import { AuthGuard, RoleGuard } from './core/guards';

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
        loadComponent: () => import('./features/public/contact/contact.component').then(m => m.ContactComponent),
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
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Cinephoria - Connexion'
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        title: 'Cinephoria - Inscription'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: 'Cinephoria - Mot de Passe Oublié'
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        title: 'Cinephoria - Réinitialiser Mot de Passe'
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
        loadComponent: () => import('./features/user/dashboard/user-dashboard.component').then(m => m.UserDashboardComponent),
        title: 'Cinephoria - Mon Espace'
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/user/reservations/reservations.component').then(m => m.ReservationsComponent),
        title: 'Cinephoria - Mes Réservations'
      },
      {
        path: 'reviews',
        loadComponent: () => import('./features/user/reviews/reviews.component').then(m => m.ReviewsComponent),
        title: 'Cinephoria - Mes Avis'
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/user/profile/profile.component').then(m => m.ProfileComponent),
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
        loadComponent: () => import('./features/management/dashboard/management-dashboard.component').then(m => m.ManagementDashboardComponent),
        title: 'Cinephoria - Tableau de Bord Employé'
      },
      {
        path: 'movies',
        loadComponent: () => import('./features/management/movies/movie-management.component').then(m => m.MovieManagementComponent),
        title: 'Cinephoria - Gestion Films'
      },
      {
        path: 'showtimes',
        loadComponent: () => import('./features/management/showtimes/showtime-management.component').then(m => m.ShowtimeManagementComponent),
        title: 'Cinephoria - Gestion Séances'
      },
      {
        path: 'theaters',
        loadComponent: () => import('./features/management/theaters/theater.component').then(m => m.TheaterComponent),
        title: 'Cinephoria - Gestion Salles'
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/management/users/user-management.component').then(m => m.UserManagementComponent),
        title: 'Cinephoria - Validation Réservations'
      },
      {
        path: 'checkin',
        loadComponent: () => import('./features/management/statistics/statistics.component').then(m => m.StatisticsComponent),
        title: 'Cinephoria - Check-in Clients'
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Routes management avec layout management (protégées pour employés et admins)
  {
    path: 'management',
    loadComponent: () => import('./layouts/management-layout/management-layout.component').then(m => m.ManagementLayoutComponent),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.Employee, UserRole.Admin] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/management/dashboard/management-dashboard.component').then(m => m.ManagementDashboardComponent),
        title: 'Cinephoria - Tableau de Bord Management'
      },
      {
        path: 'movies',
        loadComponent: () => import('./features/management/movies/movie-management.component').then(m => m.MovieManagementComponent),
        title: 'Cinephoria - Gestion Films'
      },
      {
        path: 'showtimes',
        loadComponent: () => import('./features/management/showtimes/showtime-management.component').then(m => m.ShowtimeManagementComponent),
        title: 'Cinephoria - Gestion Séances'
      },
      {
        path: 'theaters',
        loadComponent: () => import('./features/management/theaters/theater.component').then(m => m.TheaterComponent),
        title: 'Cinephoria - Gestion Salles'
      },
      {
        path: 'reservations',
        loadComponent: () => import('./features/management/users/user-management.component').then(m => m.UserManagementComponent),
        title: 'Cinephoria - Gestion Réservations'
      },
      {
        path: 'incidents',
        loadComponent: () => import('./features/management/statistics/statistics.component').then(m => m.StatisticsComponent),
        title: 'Cinephoria - Gestion Incidents'
      },
      {
        path: 'statistics',
        loadComponent: () => import('./features/management/statistics/statistics.component').then(m => m.StatisticsComponent),
        title: 'Cinephoria - Statistiques'
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/management/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Cinephoria - Paramètres'
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
        loadComponent: () => import('./features/management/dashboard/management-dashboard.component').then(m => m.ManagementDashboardComponent),
        title: 'Cinephoria - Tableau de Bord Admin'
      },
      {
        path: 'movies',
        loadComponent: () => import('./features/management/movies/movie-management.component').then(m => m.MovieManagementComponent),
        title: 'Cinephoria - Gestion Films'
      },
      {
        path: 'showtimes',
        loadComponent: () => import('./features/management/showtimes/showtime-management.component').then(m => m.ShowtimeManagementComponent),
        title: 'Cinephoria - Gestion Séances'
      },
      {
        path: 'theaters',
        loadComponent: () => import('./features/management/theaters/theater.component').then(m => m.TheaterComponent),
        title: 'Cinephoria - Gestion Salles'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/management/users/user-management.component').then(m => m.UserManagementComponent),
        title: 'Cinephoria - Gestion Utilisateurs'
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/management/employees/employee-management.component').then(m => m.EmployeeManagementComponent),
        title: 'Cinephoria - Gestion Employés'
      },
      {
        path: 'cinemas',
        loadComponent: () => import('./features/management/cinema/cinema.component').then(m => m.CinemaComponent),
        title: 'Cinephoria - Gestion Cinémas'
      },
      {
        path: 'statistics',
        loadComponent: () => import('./features/management/statistics/statistics.component').then(m => m.StatisticsComponent),
        title: 'Cinephoria - Statistiques'
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/management/settings/settings.component').then(m => m.SettingsComponent),
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
    loadComponent: () => import('./features/public/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Cinephoria - Page Non Trouvée'
  }
];