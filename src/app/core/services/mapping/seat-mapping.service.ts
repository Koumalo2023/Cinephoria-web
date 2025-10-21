import { Injectable } from '@angular/core';
import { Seat, SeatRow, SeatSelection } from '../../../shared/components/molecules/seat-selection-grid/seat-selection-grid.component';
import { SeatDto, UpdateSeatDto } from '../../interfaces/core.interfaces';

/**
 * Service de transformation entre les DTOs API et les interfaces UI pour les sièges
 * 
 * Ce service gère la conversion bidirectionnelle entre :
 * - SeatDto (API backend) ↔ Seat (interface UI)
 * - Tableaux de sièges ↔ structure de rangées pour l'affichage
 * - Calcul des prix et types de sièges
 */
@Injectable({
  providedIn: 'root'
})
export class SeatMappingService {
  private readonly basePrice = 12; // Prix de base standard pour un siège
  private readonly taxRate = 0.20; // TVA 20%

  /**
   * Transforme un SeatDto API en interface UI Seat
   * @param seatDto Le siège provenant de l'API
   * @returns L'interface UI Seat pour l'affichage
   */
  mapSeatDtoToUi(seatDto: SeatDto): Seat {
    return {
      id: seatDto.seatId.toString(),
      row: seatDto.row,
      number: seatDto.column,
      type: this.getSeatTypeFromDto(seatDto),
      status: this.getSeatStatusFromDto(seatDto),
      price: this.calculateSeatPrice(seatDto),
      features: this.getSeatFeatures(seatDto)
    };
  }

  /**
   * Transforme un tableau de SeatDto en structure de rangées pour l'affichage
   * @param seats Tableau de sièges provenant de l'API
   * @returns Structure de rangées organisée pour l'UI
   */
  mapSeatDtosToRows(seats: SeatDto[]): SeatRow[] {
    if (!seats || seats.length === 0) {
      return [];
    }

    const rowsMap = new Map<string, Seat[]>();
    
    seats.forEach(seatDto => {
      const seatUi = this.mapSeatDtoToUi(seatDto);
      const rowKey = seatDto.row;
      
      if (!rowsMap.has(rowKey)) {
        rowsMap.set(rowKey, []);
      }
      rowsMap.get(rowKey)!.push(seatUi);
    });

    // Convertir la Map en tableau de SeatRow et trier par rangée
    return Array.from(rowsMap.entries())
      .map(([row, seats]) => ({
        row,
        seats: seats.sort((a, b) => a.number - b.number)
      }))
      .sort((a, b) => a.row.localeCompare(b.row));
  }

  /**
   * Transforme une sélection UI en DTO de mise à jour pour l'API
   * @param seat Le siège de l'interface UI
   * @param theaterId L'ID de la salle
   * @returns Le DTO de mise à jour pour l'API
   */
  mapUiSeatToUpdateDto(seat: Seat, theaterId: number): UpdateSeatDto {
    return {
      seatId: parseInt(seat.id),
      isAvailable: seat.status === 'available',
      isHandicapAccessible: seat.type === 'handicap',
      priceAdjustment: this.calculatePriceAdjustment(seat.price || 0)
    };
  }

  /**
   * Transforme un tableau de sièges UI en DTOs de mise à jour
   * @param seats Tableau de sièges UI
   * @param theaterId L'ID de la salle
   * @returns Tableau de DTOs de mise à jour
   */
  mapUiSeatsToUpdateDtos(seats: Seat[], theaterId: number): UpdateSeatDto[] {
    return seats.map(seat => this.mapUiSeatToUpdateDto(seat, theaterId));
  }

  /**
   * Transforme une sélection de sièges en structure pour l'API de réservation
   * @param selection La sélection de sièges UI
   * @returns Les numéros de siège pour l'API
   */
  mapSelectionToSeatNumbers(selection: SeatSelection): string[] {
    return selection.seats.map(seat => `${seat.row}${seat.number}`);
  }

  /**
   * Calcule le prix total d'une sélection avec taxes
   * @param selection La sélection de sièges
   * @returns Le prix total TTC
   */
  calculateTotalPriceWithTax(selection: SeatSelection): number {
    const subtotal = selection.totalPrice;
    const tax = subtotal * this.taxRate;
    return subtotal + tax;
  }

  /**
   * Obtient le type de siège basé sur les propriétés du DTO
   * @param seat Le siège DTO
   * @returns Le type de siège pour l'UI
   */
  private getSeatTypeFromDto(seat: SeatDto): 'standard' | 'vip' | 'handicap' | 'couple' {
    if (seat.isHandicapAccessible) {
      return 'handicap';
    }
    
    // Déterminer VIP/premium basé sur l'ajustement de prix
    if (seat.priceAdjustment > 5) {
      return 'vip';
    }
    
    if (seat.priceAdjustment > 2) {
      return 'couple'; // Utilisé comme premium
    }
    
    return 'standard';
  }

  /**
   * Obtient le statut du siège basé sur la disponibilité
   * @param seat Le siège DTO
   * @returns Le statut pour l'UI
   */
  private getSeatStatusFromDto(seat: SeatDto): 'available' | 'selected' | 'occupied' | 'reserved' | 'blocked' {
    if (!seat.isAvailable) {
      return 'occupied';
    }
    return 'available';
  }

  /**
   * Calcule le prix du siège basé sur le prix de base et l'ajustement
   * @param seat Le siège DTO
   * @returns Le prix calculé
   */
  private calculateSeatPrice(seat: SeatDto): number {
    return this.basePrice + seat.priceAdjustment;
  }

  /**
   * Calcule l'ajustement de prix basé sur le prix UI
   * @param price Le prix de l'UI
   * @returns L'ajustement de prix pour l'API
   */
  private calculatePriceAdjustment(price: number): number {
    return price - this.basePrice;
  }

  /**
   * Obtient les caractéristiques du siège
   * @param seat Le siège DTO
   * @returns Tableau de caractéristiques
   */
  private getSeatFeatures(seat: SeatDto): string[] {
    const features: string[] = [];
    
    if (seat.isHandicapAccessible) {
      features.push('handicap');
    }
    
    if (seat.priceAdjustment > 5) {
      features.push('vip');
    }
    
    if (seat.priceAdjustment > 2) {
      features.push('premium');
    }
    
    return features;
  }

  /**
   * Génère une structure de rangées par défaut pour une nouvelle salle
   * @param rows Nombre de rangées
   * @param seatsPerRow Nombre de sièges par rangée
   * @param theaterId ID de la salle
   * @returns Structure de rangées par défaut
   */
  generateDefaultLayout(rows: number, seatsPerRow: number, theaterId: number): SeatRow[] {
    const seatRows: SeatRow[] = [];
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    for (let i = 0; i < rows; i++) {
      const row = rowLetters[i];
      const seats: Seat[] = [];
      
      for (let j = 1; j <= seatsPerRow; j++) {
        seats.push({
          id: `${theaterId}-${row}${j}`,
          row: row,
          number: j,
          type: 'standard',
          status: 'available',
          price: this.basePrice,
          features: []
        });
      }
      
      seatRows.push({ row, seats });
    }
    
    return seatRows;
  }

  /**
   * Valide la cohérence des données entre DTOs et UI
   * @param seatDto Le siège DTO
   * @param seatUi Le siège UI
   * @returns True si les données sont cohérentes
   */
  validateDataConsistency(seatDto: SeatDto, seatUi: Seat): boolean {
    return (
      seatDto.seatId.toString() === seatUi.id &&
      seatDto.row === seatUi.row &&
      seatDto.column === seatUi.number &&
      this.getSeatTypeFromDto(seatDto) === seatUi.type &&
      this.getSeatStatusFromDto(seatDto) === seatUi.status
    );
  }

  /**
   * Obtient les statistiques d'une liste de sièges
   * @param seats Liste de sièges DTO
   * @returns Statistiques de disponibilité
   */
  getSeatStatistics(seats: SeatDto[]): {
    total: number;
    available: number;
    occupied: number;
    handicap: number;
    vip: number;
  } {
    const stats = {
      total: seats.length,
      available: 0,
      occupied: 0,
      handicap: 0,
      vip: 0
    };

    seats.forEach(seat => {
      if (seat.isAvailable) {
        stats.available++;
      } else {
        stats.occupied++;
      }
      
      if (seat.isHandicapAccessible) {
        stats.handicap++;
      }
      
      if (seat.priceAdjustment > 5) {
        stats.vip++;
      }
    });

    return stats;
  }
}