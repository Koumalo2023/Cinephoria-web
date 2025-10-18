import { Injectable } from '@angular/core';
import { UserRole, ROLE_PERMISSIONS } from '../enums/user-role.enum';
import { ReservationStatus, RESERVATION_STATUS_INFO } from '../enums/reservation-status.enum';
import { MovieGenre, GENRE_INFO } from '../enums/movie-genre.enum';

/**
 * Service pour la gestion centralisée des enums dans l'application web
 * Fournit des méthodes utilitaires pour travailler avec les enums
 */
@Injectable({
  providedIn: 'root'
})
export class EnumService {

  /**
   * Récupère les informations d'un rôle utilisateur
   */
  getUserRoleInfo(role: UserRole) {
    return ROLE_PERMISSIONS[role];
  }

  /**
   * Récupère tous les rôles utilisateur disponibles
   */
  getAllUserRoles(): { value: UserRole; label: string; permissions: any }[] {
    return [
      {
        value: UserRole.User,
        label: 'Utilisateur',
        permissions: ROLE_PERMISSIONS[UserRole.User]
      },
      {
        value: UserRole.Employee,
        label: 'Employé',
        permissions: ROLE_PERMISSIONS[UserRole.Employee]
      },
      {
        value: UserRole.Admin,
        label: 'Administrateur',
        permissions: ROLE_PERMISSIONS[UserRole.Admin]
      }
    ];
  }

  /**
   * Récupère les informations d'un statut de réservation
   */
  getReservationStatusInfo(status: ReservationStatus) {
    return RESERVATION_STATUS_INFO[status];
  }

  /**
   * Récupère tous les statuts de réservation disponibles
   */
  getAllReservationStatuses(): { value: ReservationStatus; label: string; color: string }[] {
    return Object.values(ReservationStatus)
      .filter(value => typeof value === 'number')
      .map(status => ({
        value: status as ReservationStatus,
        label: RESERVATION_STATUS_INFO[status as ReservationStatus].label,
        color: RESERVATION_STATUS_INFO[status as ReservationStatus].color
      }));
  }

  /**
   * Récupère les informations d'un genre de film
   */
  getMovieGenreInfo(genre: MovieGenre) {
    return GENRE_INFO[genre];
  }

  /**
   * Récupère tous les genres de films disponibles
   */
  getAllMovieGenres(): { value: MovieGenre; label: string; color: string; icon?: string }[] {
    return Object.values(MovieGenre)
      .filter(value => typeof value === 'number')
      .map(genre => ({
        value: genre as MovieGenre,
        label: GENRE_INFO[genre as MovieGenre].label,
        color: GENRE_INFO[genre as MovieGenre].color,
        icon: GENRE_INFO[genre as MovieGenre].icon
      }));
  }

  /**
   * Récupère les genres par nom (recherche insensible à la casse)
   */
  getGenresByNames(genreNames: string[]): MovieGenre[] {
    const genreMap = this.getAllMovieGenres().reduce((acc, genre) => {
      acc[genre.label.toLowerCase()] = genre.value;
      return acc;
    }, {} as Record<string, MovieGenre>);

    return genreNames
      .map(name => name.toLowerCase())
      .map(name => genreMap[name])
      .filter(genre => genre !== undefined);
  }

  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  hasPermission(role: UserRole, permission: keyof typeof ROLE_PERMISSIONS[UserRole]): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    return permissions ? permissions[permission] : false;
  }

  /**
   * Récupère le libellé d'un enum à partir de sa valeur numérique
   */
  getEnumLabel<T extends Record<string, any>>(enumObj: T, value: number): string {
    const key = Object.keys(enumObj).find(k => enumObj[k] === value);
    return key ? this.formatEnumLabel(key) : 'Inconnu';
  }

  /**
   * Formate un libellé d'enum (ex: "ScienceFiction" -> "Science Fiction")
   */
  private formatEnumLabel(label: string): string {
    // Gère les cas spéciaux
    if (label === 'ScienceFiction') return 'Science-Fiction';
    
    // Insert des espaces avant les majuscules
    return label.replace(/([A-Z])/g, ' $1').trim();
  }

  /**
   * Convertit un tableau de valeurs enum en libellés
   */
  enumValuesToLabels<T extends Record<string, any>>(enumObj: T, values: number[]): string[] {
    return values.map(value => this.getEnumLabel(enumObj, value));
  }

  /**
   * Récupère les statistiques d'utilisation des enums
   */
  getEnumStats() {
    return {
      userRoles: {
        total: Object.keys(UserRole).length / 2, // Division par 2 car TypeScript génère des clés inverses
        available: this.getAllUserRoles().length
      },
      reservationStatuses: {
        total: Object.keys(ReservationStatus).length / 2,
        available: this.getAllReservationStatuses().length
      },
      movieGenres: {
        total: Object.keys(MovieGenre).length / 2,
        available: this.getAllMovieGenres().length
      }
    };
  }

  /**
   * Valide si une valeur est valide pour un enum donné
   */
  isValidEnumValue<T extends Record<string, any>>(enumObj: T, value: number): boolean {
    return Object.values(enumObj).includes(value);
  }

  /**
   * Récupère les valeurs valides d'un enum
   */
  getValidEnumValues<T extends Record<string, any>>(enumObj: T): number[] {
    return Object.values(enumObj)
      .filter(value => typeof value === 'number') as number[];
  }

  /**
   * Crée un sélecteur d'options pour les formulaires
   */
  createSelectOptions<T extends Record<string, any>>(
    enumObj: T, 
    labelFn: (value: number) => string = (value) => this.getEnumLabel(enumObj, value)
  ): { value: number; label: string }[] {
    return this.getValidEnumValues(enumObj).map(value => ({
      value,
      label: labelFn(value)
    }));
  }
}