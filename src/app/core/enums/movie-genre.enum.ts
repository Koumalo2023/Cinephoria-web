/**
 * Enumération des genres de films
 * Compatible avec l'API backend (valeurs numériques)
 */
export enum MovieGenre {
  Action = 0,
  Adventure = 1,
  Animation = 2,
  Comedy = 3,
  Crime = 4,
  Documentary = 5,
  Drama = 6,
  Fantasy = 7,
  Horror = 8,
  Mystery = 9,
  Romance = 10,
  ScienceFiction = 11,
  Thriller = 12,
  Western = 13,
  Family = 14,
  Musical = 15,
  War = 16,
  Biography = 17,
  History = 18
}

/**
 * Interface pour les informations de genre
 */
export interface GenreInfo {
  label: string;
  color: string;
  icon?: string;
}

/**
 * Mappage des informations de genre
 */
export const GENRE_INFO: Record<MovieGenre, GenreInfo> = {
  [MovieGenre.Action]: {
    label: 'Action',
    color: 'danger',
    icon: 'flash'
  },
  [MovieGenre.Adventure]: {
    label: 'Aventure',
    color: 'warning',
    icon: 'compass'
  },
  [MovieGenre.Animation]: {
    label: 'Animation',
    color: 'primary',
    icon: 'color-palette'
  },
  [MovieGenre.Comedy]: {
    label: 'Comédie',
    color: 'success',
    icon: 'happy'
  },
  [MovieGenre.Crime]: {
    label: 'Crime',
    color: 'dark',
    icon: 'shield'
  },
  [MovieGenre.Documentary]: {
    label: 'Documentaire',
    color: 'secondary',
    icon: 'document'
  },
  [MovieGenre.Drama]: {
    label: 'Drame',
    color: 'info',
    icon: 'heart'
  },
  [MovieGenre.Fantasy]: {
    label: 'Fantastique',
    color: 'purple',
    icon: 'sparkles'
  },
  [MovieGenre.Horror]: {
    label: 'Horreur',
    color: 'dark',
    icon: 'skull'
  },
  [MovieGenre.Mystery]: {
    label: 'Mystère',
    color: 'medium',
    icon: 'search'
  },
  [MovieGenre.Romance]: {
    label: 'Romance',
    color: 'pink',
    icon: 'heart'
  },
  [MovieGenre.ScienceFiction]: {
    label: 'Science-Fiction',
    color: 'teal',
    icon: 'rocket'
  },
  [MovieGenre.Thriller]: {
    label: 'Thriller',
    color: 'orange',
    icon: 'alert'
  },
  [MovieGenre.Western]: {
    label: 'Western',
    color: 'brown',
    icon: 'cowboy'
  },
  [MovieGenre.Family]: {
    label: 'Famille',
    color: 'success',
    icon: 'people'
  },
  [MovieGenre.Musical]: {
    label: 'Musical',
    color: 'yellow',
    icon: 'musical-notes'
  },
  [MovieGenre.War]: {
    label: 'Guerre',
    color: 'danger',
    icon: 'flag'
  },
  [MovieGenre.Biography]: {
    label: 'Biographie',
    color: 'secondary',
    icon: 'person'
  },
  [MovieGenre.History]: {
    label: 'Historique',
    color: 'brown',
    icon: 'time'
  }
};