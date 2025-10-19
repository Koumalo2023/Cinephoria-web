import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Interfaces core
import { CinemaDto } from '../../../../core/interfaces/core.interfaces';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  @Input() variant: 'default' | 'compact' = 'default';
  @Input() showCinemaInfo: boolean = true;
  @Input() showSocialLinks: boolean = true;
  @Input() showLegalLinks: boolean = true;

  // Données des cinémas (simulées)
  cinemas: CinemaDto[] = [
    {
      cinemaId: 1,
      name: 'Cinephoria Paris',
      address: '123 Avenue des Champs-Élysées',
      city: 'Paris',
      country: 'France',
      phoneNumber: '+33 1 42 68 53 01',
      openingHours: '10:00 - 23:00',
      showtimes: [],
      theaters: []
    },
    {
      cinemaId: 2,
      name: 'Cinephoria Lyon',
      address: '45 Rue de la République',
      city: 'Lyon',
      country: 'France',
      phoneNumber: '+33 4 78 42 53 01',
      openingHours: '10:00 - 23:00',
      showtimes: [],
      theaters: []
    },
    {
      cinemaId: 3,
      name: 'Cinephoria Marseille',
      address: '78 Vieux Port',
      city: 'Marseille',
      country: 'France',
      phoneNumber: '+33 4 91 54 53 01',
      openingHours: '10:00 - 23:00',
      showtimes: [],
      theaters: []
    }
  ];

  // Liens de navigation
  navigationLinks = [
    {
      title: 'Navigation',
      links: [
        { label: 'Accueil', routerLink: ['/'] },
        { label: 'Films', routerLink: ['/movies'] },
        { label: 'Réservations', routerLink: ['/reservations'] },
        { label: 'Contact', routerLink: ['/contact'] }
      ]
    },
    {
      title: 'Informations',
      links: [
        { label: 'À propos', routerLink: ['/about'] },
        { label: 'FAQ', routerLink: ['/faq'] },
        { label: 'Tarifs', routerLink: ['/pricing'] },
        { label: 'Accessibilité', routerLink: ['/accessibility'] }
      ]
    },
    {
      title: 'Légal',
      links: [
        { label: 'Mentions légales', routerLink: ['/legal'] },
        { label: 'CGU', routerLink: ['/terms'] },
        { label: 'Politique de confidentialité', routerLink: ['/privacy'] },
        { label: 'Cookies', routerLink: ['/cookies'] }
      ]
    }
  ];

  // Liens sociaux
  socialLinks = [
    { 
      name: 'Facebook', 
      icon: 'facebook', 
      url: 'https://facebook.com/cinephoria',
      color: '#1877F2'
    },
    { 
      name: 'Twitter', 
      icon: 'twitter', 
      url: 'https://twitter.com/cinephoria',
      color: '#1DA1F2'
    },
    { 
      name: 'Instagram', 
      icon: 'instagram', 
      url: 'https://instagram.com/cinephoria',
      color: '#E4405F'
    },
    { 
      name: 'YouTube', 
      icon: 'youtube', 
      url: 'https://youtube.com/cinephoria',
      color: '#FF0000'
    }
  ];

  currentYear: number = new Date().getFullYear();

  ngOnInit(): void {
    // Initialisation du composant
  }

  // Obtient les informations de contact principales
  get mainContactInfo() {
    return this.cinemas[0]; // Premier cinéma comme contact principal
  }

  // Formate le numéro de téléphone pour l'affichage
  formatPhoneNumber(phone: string): string {
    return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  // Obtient l'email du cinéma basé sur le nom
  getCinemaEmail(cinemaName: string): string {
    const cinema = this.cinemas.find(c => c.name === cinemaName);
    if (cinema) {
      const city = cinema.city.toLowerCase();
      return `${city}&#64;cinephoria.com`;
    }
    return 'contact&#64;cinephoria.com';
  }

  // Ouvre un lien externe
  openExternalLink(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // Navigation vers une route
  navigateTo(route: string[]): void {
    // La navigation est gérée par le routerLink dans le template
  }

  // Classes CSS dynamiques
  get footerClasses(): string {
    const classes = ['footer'];
    classes.push(`footer--${this.variant}`);
    return classes.join(' ');
  }

  get containerClasses(): string {
    return this.variant === 'compact' ? 'footer-container compact' : 'footer-container';
  }
}
