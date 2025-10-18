/**
 * Enumération des statuts de réservation
 * Compatible avec l'API backend (valeurs numériques)
 */
export enum ReservationStatus {
  Pending = 0,
  Confirmed = 1,
  Cancelled = 2,
  Completed = 3,
  Expired = 4
}

/**
 * Interface pour les informations de statut de réservation
 */
export interface ReservationStatusInfo {
  label: string;
  color: string;
  canCancel: boolean;
  canModify: boolean;
}

/**
 * Mappage des informations de statut de réservation
 */
export const RESERVATION_STATUS_INFO: Record<ReservationStatus, ReservationStatusInfo> = {
  [ReservationStatus.Pending]: {
    label: 'En attente',
    color: 'warning',
    canCancel: true,
    canModify: true
  },
  [ReservationStatus.Confirmed]: {
    label: 'Confirmée',
    color: 'success',
    canCancel: true,
    canModify: false
  },
  [ReservationStatus.Cancelled]: {
    label: 'Annulée',
    color: 'danger',
    canCancel: false,
    canModify: false
  },
  [ReservationStatus.Completed]: {
    label: 'Terminée',
    color: 'info',
    canCancel: false,
    canModify: false
  },
  [ReservationStatus.Expired]: {
    label: 'Expirée',
    color: 'secondary',
    canCancel: false,
    canModify: false
  }
};