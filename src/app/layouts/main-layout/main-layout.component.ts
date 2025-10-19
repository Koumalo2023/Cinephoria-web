import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

// Composants partagés
import { HeaderComponent } from '../../shared/components/organisms/header/header.component';
import { FooterComponent } from '../../shared/components/organisms/footer/footer.component';

// Interfaces core
import { AppUserDto } from '../../core/interfaces/core.interfaces';
import { UserRole } from '../../core/enums/user-role.enum';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  // Utilisateur simulé pour le layout principal (peut être null pour invité)
  currentUser: AppUserDto | null = {
    appUserId: 'user-12345',
    firstName: 'Pierre',
    lastName: 'Durand',
    email: 'pierre.durand@email.com',
    userName: 'pdurand',
    emailConfirmed: true,
    phoneNumber: '+33123456789',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-10-18'),
    hasApprovedTermsOfUse: true,
    hiredDate: undefined,
    position: '',
    profilePictureUrl: '',
    reportedIncidents: [],
    resolvedByIncidents: [],
    role: UserRole.User,
    reservations: [],
    movieRatings: [],
    favoriteMovies: [],
    userMovieHistories: [],
    employeeFavorites: []
  };

  // Configuration du layout principal
  headerConfig = {
    variant: 'default' as const,
    showLogo: true,
    showNavigation: true,
    showUserMenu: true
  };

  footerConfig = {
    variant: 'default' as const,
    showCinemaInfo: true,
    showSocialLinks: true,
    showLegalLinks: true
  };

  // Données pour la page d'accueil (simulées)
  featuredMovies = [
    {
      id: 1,
      title: 'Dune : Partie Deux',
      genre: 'Science-Fiction',
      duration: '2h46',
      rating: 4.8,
      posterUrl: '/assets/posters/dune2.jpg'
    },
    {
      id: 2,
      title: 'Oppenheimer',
      genre: 'Drame Historique',
      duration: '3h00',
      rating: 4.7,
      posterUrl: '/assets/posters/oppenheimer.jpg'
    },
    {
      id: 3,
      title: 'Barbie',
      genre: 'Comédie',
      duration: '1h54',
      rating: 4.5,
      posterUrl: '/assets/posters/barbie.jpg'
    }
  ];

  upcomingMovies = [
    {
      id: 4,
      title: 'Gladiator 2',
      genre: 'Action',
      releaseDate: '15 Nov 2024',
      posterUrl: '/assets/posters/gladiator2.jpg'
    },
    {
      id: 5,
      title: 'Deadpool & Wolverine',
      genre: 'Action/Comédie',
      releaseDate: '26 Juil 2024',
      posterUrl: '/assets/posters/deadpool3.jpg'
    }
  ];

  ngOnInit(): void {
    // Initialisation du layout principal
    console.log('Main Layout initialisé');
  }

  // Gestion de la déconnexion
  onLogout(): void {
    console.log('Déconnexion de l\'utilisateur');
    this.currentUser = null;
  }

  // Gestion des actions utilisateur
  onUserAction(action: string): void {
    console.log(`Action utilisateur: ${action}`);
    
    switch (action) {
      case 'search_movies':
        this.searchMovies();
        break;
      case 'view_profile':
        this.viewUserProfile();
        break;
      case 'make_reservation':
        this.startReservation();
        break;
      default:
        console.log(`Action non reconnue: ${action}`);
    }
  }

  // Recherche de films
  private searchMovies(): void {
    console.log('Recherche de films lancée');
    // Navigation vers la page de recherche
  }

  // Affichage du profil utilisateur
  private viewUserProfile(): void {
    console.log('Affichage du profil utilisateur');
    // Navigation vers la page profil
  }

  // Début d'une réservation
  private startReservation(): void {
    console.log('Début du processus de réservation');
    // Navigation vers la sélection de film
  }

  // Obtenir le message de bienvenue
  getWelcomeMessage(): string {
    if (this.currentUser) {
      return `Bonjour ${this.currentUser.firstName} !`;
    }
    return 'Bienvenue sur Cinephoria !';
  }

  // Vérifier si l'utilisateur est connecté
  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  // Vérifier si on est sur la page d'accueil
  isHomePage(): boolean {
    // Pour l'instant, on simule que c'est la page d'accueil
    // En production, on vérifierait la route actuelle
    return true;
  }
}
