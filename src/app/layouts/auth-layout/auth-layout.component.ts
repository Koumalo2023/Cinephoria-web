import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Composant d'authentification
import { AuthFormComponent } from '../../shared/components/organisms/auth-form/auth-form.component';
import { AuthMode, AuthFormConfig } from '../../shared/components/organisms/auth-form/auth-form.component';
import { LoginUserDto, RegisterUserDto, RequestPasswordResetDto } from '../../core/interfaces/core.interfaces';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AuthFormComponent
  ],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent implements OnInit {
  // Configuration du layout d'authentification
  currentYear: number = new Date().getFullYear();
  
  // Mode d'authentification actuel
  currentMode: AuthMode = 'login';
  
  // Configuration du formulaire d'authentification
  authFormConfig: AuthFormConfig = {
    mode: 'login',
    title: 'Connexion à votre compte',
    subtitle: 'Connectez-vous pour accéder à votre espace personnel',
    showRememberMe: true,
    showSocialLogin: true,
    showForgotPassword: true,
    showSignUpLink: true,
    showLoginLink: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    allowedProviders: ['email', 'google', 'facebook', 'apple']
  };

  // État du composant
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Messages et textes pour les pages d'authentification
  authMessages = {
    welcome: "Rejoignez la communauté Cinephoria",
    description: "Accédez à votre espace personnel pour gérer vos réservations, découvrir des films et profiter d'offres exclusives",
    benefits: [
      "Réservation rapide et sécurisée",
      "Historique de vos séances",
      "Recommandations personnalisées",
      "Offres spéciales membres"
    ]
  };

  // Données pour le carrousel (simulées)
  authCarousel = [
    {
      id: 1,
      title: "Découvrez les derniers films",
      description: "Accédez en avant-première aux bandes-annonces et aux sorties",
      image: "/assets/auth/carousel-1.jpg",
      icon: "🎬"
    },
    {
      id: 2,
      title: "Réservation simplifiée",
      description: "Choisissez vos places en quelques clics, sans attente",
      image: "/assets/auth/carousel-2.jpg",
      icon: "⚡"
    },
    {
      id: 3,
      title: "Expérience personnalisée",
      description: "Recevez des recommandations basées sur vos préférences",
      image: "/assets/auth/carousel-3.jpg",
      icon: "❤️"
    }
  ];

  currentSlide: number = 0;

  ngOnInit(): void {
    // Initialisation du layout d'authentification
    console.log('Auth Layout initialisé');
    
    // Configuration initiale basée sur l'URL ou le mode par défaut
    this.initializeAuthMode();
    
    // Démarrage du carrousel automatique
    this.startCarousel();
  }

  // Initialisation du mode d'authentification
  private initializeAuthMode(): void {
    // En production, on détecterait le mode depuis la route
    // Pour l'instant, on utilise le mode par défaut
    this.updateFormConfig();
  }

  // Mise à jour de la configuration du formulaire
  private updateFormConfig(): void {
    switch (this.currentMode) {
      case 'login':
        this.authFormConfig = {
          ...this.authFormConfig,
          mode: 'login',
          title: 'Connexion à votre compte',
          subtitle: 'Connectez-vous pour accéder à votre espace personnel',
          showSignUpLink: true,
          showLoginLink: false
        };
        break;
        
      case 'register':
        this.authFormConfig = {
          ...this.authFormConfig,
          mode: 'register',
          title: 'Créer votre compte',
          subtitle: 'Rejoignez la communauté Cinephoria en quelques secondes',
          showSignUpLink: false,
          showLoginLink: true
        };
        break;
        
      case 'forgot-password':
        this.authFormConfig = {
          ...this.authFormConfig,
          mode: 'forgot-password',
          title: 'Mot de passe oublié',
          subtitle: 'Entrez votre email pour recevoir un lien de réinitialisation',
          showSocialLogin: false,
          showSignUpLink: false,
          showLoginLink: true
        };
        break;
    }
  }

  // Démarrage du carrousel automatique
  private startCarousel(): void {
    setInterval(() => {
      this.nextSlide();
    }, 5000); // Change de slide toutes les 5 secondes
  }

  // Passage au slide suivant
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.authCarousel.length;
  }

  // Passage au slide précédent
  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.authCarousel.length) % this.authCarousel.length;
  }

  // Aller à un slide spécifique
  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  // Obtenir la classe CSS pour un indicateur de slide
  getSlideIndicatorClass(index: number): string {
    return index === this.currentSlide ? 'indicator active' : 'indicator';
  }

  // Obtenir la classe CSS pour un slide
  getSlideClass(index: number): string {
    return index === this.currentSlide ? 'slide active' : 'slide';
  }

  // Vérifier si on est sur la page de connexion
  isLoginPage(): boolean {
    // Simulation - en production, on vérifierait la route actuelle
    return true;
  }

  // Vérifier si on est sur la page d'inscription
  isRegisterPage(): boolean {
    // Simulation - en production, on vérifierait la route actuelle
    return false;
  }

  // Gestion des événements d'authentification
  onAuthSubmit(authData: LoginUserDto | RegisterUserDto): void {
    console.log('Données d\'authentification soumises:', authData);
    this.loading = true;
    this.errorMessage = '';
    
    // Simulation de l'authentification
    setTimeout(() => {
      this.loading = false;
      
      if (this.currentMode === 'login') {
        const loginData = authData as LoginUserDto;
        if (loginData.email === 'demo@cinephoria.com' && loginData.password === 'password123') {
          this.successMessage = 'Connexion réussie !';
          console.log('Utilisateur connecté avec succès');
          // Redirection vers la page d'accueil
        } else {
          this.errorMessage = 'Email ou mot de passe incorrect';
        }
      } else if (this.currentMode === 'register') {
        this.successMessage = 'Compte créé avec succès ! Un email de confirmation a été envoyé.';
        console.log('Nouvel utilisateur inscrit');
        // Redirection vers la page de confirmation
      }
    }, 2000);
  }

  // Authentification via fournisseur externe
  onProviderAuth(provider: string): void {
    console.log(`Authentification via ${provider}`);
    this.loading = true;
    this.errorMessage = '';
    
    // Simulation de l'authentification sociale
    setTimeout(() => {
      this.loading = false;
      this.successMessage = `Connexion réussie avec ${provider} !`;
      console.log(`Utilisateur authentifié via ${provider}`);
    }, 1500);
  }

  // Changement de mode d'authentification
  onModeChange(newMode: AuthMode): void {
    console.log(`Changement de mode: ${this.currentMode} -> ${newMode}`);
    this.currentMode = newMode;
    this.updateFormConfig();
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Réinitialisation du mot de passe
  onPasswordReset(resetData: RequestPasswordResetDto): void {
    console.log('Demande de réinitialisation de mot de passe:', resetData);
    this.loading = true;
    
    setTimeout(() => {
      this.loading = false;
      this.successMessage = 'Un lien de réinitialisation a été envoyé à votre adresse email.';
      console.log('Email de réinitialisation envoyé');
    }, 1500);
  }

  // Obtenir le titre de la page
  getPageTitle(): string {
    return this.authFormConfig.title;
  }

  // Obtenir le sous-titre de la page
  getPageSubtitle(): string {
    return this.authFormConfig.subtitle || '';
  }

  // Obtenir le texte du lien alternatif
  getAlternateLinkText(): string {
    if (this.currentMode === 'login') {
      return "Vous n'avez pas de compte ?";
    } else if (this.currentMode === 'register') {
      return "Vous avez déjà un compte ?";
    }
    return "";
  }

  // Obtenir le texte du lien alternatif
  getAlternateLinkAction(): string {
    if (this.currentMode === 'login') {
      return "S'inscrire";
    } else if (this.currentMode === 'register') {
      return "Se connecter";
    }
    return "";
  }

  // Obtenir la route du lien alternatif
  getAlternateLinkRoute(): string[] {
    if (this.currentMode === 'login') {
      return ['/register'];
    } else if (this.currentMode === 'register') {
      return ['/login'];
    }
    return ['/'];
  }
}
