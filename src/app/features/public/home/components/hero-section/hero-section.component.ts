import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  @Output() searchQuery = new EventEmitter<string>();
  @Output() quickReservation = new EventEmitter<void>();

  searchTerm: string = '';

  constructor(private router: Router) {}

  /**
   * Émet la requête de recherche
   */
  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.searchQuery.emit(this.searchTerm.trim());
    }
  }

  /**
   * Navigation vers la page des films
   */
  navigateToMovies(): void {
    this.router.navigate(['/movies']);
  }

  /**
   * Navigation vers la page de réservation
   */
  navigateToReservation(): void {
    this.router.navigate(['/reservations']);
  }

  /**
   * Émet l'événement de réservation rapide
   */
  onQuickReservation(): void {
    this.quickReservation.emit();
  }

  /**
   * Gestion de la touche Entrée dans la recherche
   */
  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  /**
   * Efface la recherche
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.searchQuery.emit('');
  }
}