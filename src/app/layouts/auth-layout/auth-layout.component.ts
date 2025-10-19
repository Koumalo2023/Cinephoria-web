import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent implements OnInit {
  // Configuration du layout d'authentification
  currentYear: number = new Date().getFullYear();
  
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
    
    // Démarrage du carrousel automatique
    this.startCarousel();
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

  // Obtenir le titre de la page
  getPageTitle(): string {
    // Le titre sera géré par les composants enfants
    return 'Cinephoria';
  }

  // Obtenir le sous-titre de la page
  getPageSubtitle(): string {
    // Le sous-titre sera géré par les composants enfants
    return 'Rejoignez la communauté Cinephoria';
  }

  // Obtenir le texte du lien alternatif
  getAlternateLinkText(): string {
    // Les liens alternatifs seront gérés par les composants enfants
    return '';
  }

  // Obtenir le texte du lien alternatif
  getAlternateLinkAction(): string {
    // Les liens alternatifs seront gérés par les composants enfants
    return '';
  }

  // Obtenir la route du lien alternatif
  getAlternateLinkRoute(): string[] {
    // Les liens alternatifs seront gérés par les composants enfants
    return ['/'];
  }
}
