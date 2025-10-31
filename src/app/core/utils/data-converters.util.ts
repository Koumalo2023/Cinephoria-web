import { CinemaDto, MovieDto, SeatDto, ShowtimeDto, TheaterDto } from '../interfaces/core.interfaces';

/**
 * Utilitaires de conversion de données entre interfaces API et interfaces composants
 */

// Interface locale pour la compatibilité avec les composants existants
export interface LocalMovie {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  duration: string;
  genre: string;
  director: string[];
  releaseDate: Date;
  minimumAge: number;
  averageRating: number;
  isFavorite: boolean;
}

export interface LocalShowtime {
  id: number;
  movieId: number;
  theaterId: number;
  cinemaId: number;
  startTime: Date;
  endTime: Date;
  quality: string;
  price: number;
  isPromotion: boolean;
  availableSeats: number;
  totalSeats: number;
  isFull: boolean;
  isSoon: boolean;
}

export interface LocalSeat {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'vip' | 'handicap' | 'couple';
  status: 'available' | 'selected' | 'occupied' | 'reserved' | 'blocked';
  price?: number;
  features?: string[];
}

export interface LocalCinema {
  id: number;
  name: string;
  address: string;
  city: string;
  phoneNumber: string;
  openingHours: string;
}

export interface LocalTheater {
  id: number;
  name: string;
  seatCount: number;
  cinemaId: number;
  isOperational: boolean;
  projectionQuality: string;
}

/**
 * Convertit un MovieDto en LocalMovie pour la compatibilité avec les composants
 */
export function movieDtoToLocal(movie: MovieDto): LocalMovie {
  return {
    id: movie.movieId,
    title: movie.title,
    description: movie.description,
    posterUrl: movie.posterUrls || '',
    duration: movie.duration,
    genre: movie.genre.toString(),
    director: movie.director,
    releaseDate: movie.releaseDate,
    minimumAge: movie.minimumAge,
    averageRating: movie.averageRating,
    isFavorite: movie.isFavorite
  };
}

/**
 * Convertit un ShowtimeDto en LocalShowtime pour la compatibilité avec les composants
 */
export function showtimeDtoToLocal(showtime: ShowtimeDto): LocalShowtime {
  // Calculer les sièges disponibles basé sur les réservations
  const totalSeats = 100; // Valeur par défaut, à adapter selon la salle
  const reservedSeats = showtime.reservations?.length || 0;
  const availableSeats = Math.max(0, totalSeats - reservedSeats);
  
  // Vérifier si c'est bientôt (dans les 30 minutes)
  const now = new Date();
  const showtimeDate = new Date(showtime.startTime);
  const timeDiff = showtimeDate.getTime() - now.getTime();
  const isSoon = timeDiff > 0 && timeDiff <= 30 * 60 * 1000;

  return {
    id: showtime.showtimeId,
    movieId: showtime.movieId,
    theaterId: showtime.theaterId,
    cinemaId: showtime.cinemaId,
    startTime: showtime.startTime,
    endTime: showtime.endTime,
    quality: showtime.quality.toString(),
    price: showtime.price,
    isPromotion: showtime.isPromotion,
    availableSeats,
    totalSeats,
    isFull: availableSeats <= 0,
    isSoon
  };
}

/**
 * Convertit un SeatDto en LocalSeat pour la compatibilité avec les composants
 */
export function seatDtoToLocal(seat: SeatDto): LocalSeat {
  // Extraction de la rangée et du numéro à partir du seatNumber
  const row = seat.seatNumber.match(/^([A-Z]+)/)?.[0] || '';
  const number = parseInt(seat.seatNumber.match(/\d+$/)?.[0] || '0', 10);

  return {
    id: seat.seatId.toString(),
    row,
    number,
    type: seat.isAccessible ? 'handicap' : 'standard',
    status: seat.isAvailable ? 'available' : 'occupied',
    price: seat.isAccessible ? 9.90 : 9.90, // Prix par défaut
    features: seat.isAccessible ? ['accessible'] : []
  };
}

/**
 * Convertit un CinemaDto en LocalCinema pour la compatibilité avec les composants
 */
export function cinemaDtoToLocal(cinema: CinemaDto): LocalCinema {
  return {
    id: cinema.cinemaId,
    name: cinema.name,
    address: cinema.address,
    city: cinema.city,
    phoneNumber: cinema.phoneNumber,
    openingHours: cinema.openingHours
  };
}

/**
 * Convertit un TheaterDto en LocalTheater pour la compatibilité avec les composants
 */
export function theaterDtoToLocal(theater: TheaterDto): LocalTheater {
  return {
    id: theater.theaterId,
    name: theater.name,
    seatCount: theater.seatCount,
    cinemaId: theater.cinemaId,
    isOperational: theater.isOperational,
    projectionQuality: theater.projectionQuality.toString()
  };
}

/**
 * Convertit un LocalMovie en MovieDto pour l'envoi à l'API
 */
export function localToMovieDto(movie: LocalMovie): MovieDto {
  return {
    movieId: movie.id,
    title: movie.title,
    description: movie.description,
    genre: movie.genre as any, // Conversion de type
    duration: movie.duration,
    director: movie.director,
    releaseDate: movie.releaseDate,
    minimumAge: movie.minimumAge,
    isFavorite: movie.isFavorite,
    averageRating: movie.averageRating,
    posterUrls: movie.posterUrl,
    actors: [], // À compléter selon les données
    filmsSimilaires: [],
    showtimes: [],
    movieRatings: []
  };
}

/**
 * Convertit un LocalShowtime en ShowtimeDto pour l'envoi à l'API
 */
export function localToShowtimeDto(showtime: LocalShowtime): ShowtimeDto {
  return {
    showtimeId: showtime.id,
    movieId: showtime.movieId,
    theaterId: showtime.theaterId,
    cinemaId: showtime.cinemaId,
    startTime: showtime.startTime,
    endTime: showtime.endTime,
    quality: showtime.quality as any, // Conversion de type
    price: showtime.price,
    priceAdjustment: 0, // À adapter
    isPromotion: showtime.isPromotion,
    reservations: []
  };
}

/**
 * Convertit un LocalSeat en SeatDto pour l'envoi à l'API
 */
export function localToSeatDto(seat: LocalSeat): SeatDto {
  return {
    seatId: parseInt(seat.id, 10),
    theaterId: 0, // À compléter selon le contexte
    seatNumber: `${seat.row}${seat.number}`,
    updatedAt: new Date(),
    isAccessible: seat.type === 'handicap',
    isAvailable: seat.status === 'available'
  };
}

/**
 * Groupe les séances par date pour l'affichage dans le sélecteur
 */
export function groupShowtimesByDate(showtimes: ShowtimeDto[]): Array<{
  date: string;
  dayOfWeek: string;
  showtimes: ShowtimeDto[];
}> {
  const groups: { [key: string]: ShowtimeDto[] } = {};

  showtimes.forEach(showtime => {
    const date = new Date(showtime.startTime);
    const dateKey = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(showtime);
  });

  return Object.keys(groups).map(dateKey => {
    const date = new Date(dateKey);
    return {
      date: dateKey,
      dayOfWeek: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
      showtimes: groups[dateKey]
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Organise les sièges par rangée pour l'affichage dans la grille
 */
export function organizeSeatsByRow(seats: SeatDto[]): Array<{
  row: string;
  seats: SeatDto[];
}> {
  const rows: { [key: string]: SeatDto[] } = {};

  seats.forEach(seat => {
    const row = seat.seatNumber.match(/^([A-Z]+)/)?.[0] || '';
    
    if (!rows[row]) {
      rows[row] = [];
    }
    rows[row].push(seat);
  });

  return Object.keys(rows).map(row => ({
    row,
    seats: rows[row].sort((a, b) => {
      const numA = parseInt(a.seatNumber.match(/\d+$/)?.[0] || '0', 10);
      const numB = parseInt(b.seatNumber.match(/\d+$/)?.[0] || '0', 10);
      return numA - numB;
    })
  })).sort((a, b) => a.row.localeCompare(b.row));
}