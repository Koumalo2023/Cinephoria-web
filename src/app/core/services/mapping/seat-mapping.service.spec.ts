import { TestBed } from '@angular/core/testing';
import { Seat } from '../../../shared/components/molecules/seat-selection-grid/seat-selection-grid.component';
import { SeatDto } from '../../interfaces/core.interfaces';
import { SeatMappingService } from './seat-mapping.service';

describe('SeatMappingService', () => {
  let service: SeatMappingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeatMappingService]
    });
    service = TestBed.inject(SeatMappingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('mapSeatDtoToUi', () => {
    it('should map standard seat correctly', () => {
      const seatDto: SeatDto = {
        seatId: 1,
        theaterId: 1,
        seatNumber: 'A1',
        row: 'A',
        column: 1,
        isAvailable: true,
        isHandicapAccessible: false,
        priceAdjustment: 0
      };

      const result = service.mapSeatDtoToUi(seatDto);

      expect(result.id).toBe('1');
      expect(result.row).toBe('A');
      expect(result.number).toBe(1);
      expect(result.type).toBe('standard');
      expect(result.status).toBe('available');
      expect(result.price).toBe(12); // 12 + 0
      expect(result.features).toEqual([]);
    });

    it('should map handicap seat correctly', () => {
      const seatDto: SeatDto = {
        seatId: 2,
        theaterId: 1,
        seatNumber: 'B1',
        row: 'B',
        column: 1,
        isAvailable: true,
        isHandicapAccessible: true,
        priceAdjustment: 0
      };

      const result = service.mapSeatDtoToUi(seatDto);

      expect(result.type).toBe('handicap');
      expect(result.features).toContain('handicap');
    });

    it('should map VIP seat correctly', () => {
      const seatDto: SeatDto = {
        seatId: 3,
        theaterId: 1,
        seatNumber: 'C1',
        row: 'C',
        column: 1,
        isAvailable: true,
        isHandicapAccessible: false,
        priceAdjustment: 6
      };

      const result = service.mapSeatDtoToUi(seatDto);

      expect(result.type).toBe('vip');
      expect(result.price).toBe(18); // 12 + 6
      expect(result.features).toContain('vip');
    });

    it('should map occupied seat correctly', () => {
      const seatDto: SeatDto = {
        seatId: 4,
        theaterId: 1,
        seatNumber: 'D1',
        row: 'D',
        column: 1,
        isAvailable: false,
        isHandicapAccessible: false,
        priceAdjustment: 0
      };

      const result = service.mapSeatDtoToUi(seatDto);

      expect(result.status).toBe('occupied');
    });
  });

  describe('mapSeatDtosToRows', () => {
    it('should organize seats into rows correctly', () => {
      const seats: SeatDto[] = [
        {
          seatId: 1,
          theaterId: 1,
          seatNumber: 'A1',
          row: 'A',
          column: 1,
          isAvailable: true,
          isHandicapAccessible: false,
          priceAdjustment: 0
        },
        {
          seatId: 2,
          theaterId: 1,
          seatNumber: 'A2',
          row: 'A',
          column: 2,
          isAvailable: true,
          isHandicapAccessible: false,
          priceAdjustment: 0
        },
        {
          seatId: 3,
          theaterId: 1,
          seatNumber: 'B1',
          row: 'B',
          column: 1,
          isAvailable: true,
          isHandicapAccessible: false,
          priceAdjustment: 0
        }
      ];

      const result = service.mapSeatDtosToRows(seats);

      expect(result.length).toBe(2);
      expect(result[0].row).toBe('A');
      expect(result[0].seats.length).toBe(2);
      expect(result[1].row).toBe('B');
      expect(result[1].seats.length).toBe(1);
    });

    it('should sort seats by number within rows', () => {
      const seats: SeatDto[] = [
        {
          seatId: 1,
          theaterId: 1,
          seatNumber: 'A2',
          row: 'A',
          column: 2,
          isAvailable: true,
          isHandicapAccessible: false,
          priceAdjustment: 0
        },
        {
          seatId: 2,
          theaterId: 1,
          seatNumber: 'A1',
          row: 'A',
          column: 1,
          isAvailable: true,
          isHandicapAccessible: false,
          priceAdjustment: 0
        }
      ];

      const result = service.mapSeatDtosToRows(seats);

      expect(result[0].seats[0].number).toBe(1);
      expect(result[0].seats[1].number).toBe(2);
    });

    it('should sort rows alphabetically', () => {
      const seats: SeatDto[] = [
        {
          seatId: 1,
          theaterId: 1,
          seatNumber: 'B1',
          row: 'B',
          column: 1,
          isAvailable: true,
          isHandicapAccessible: false,
          priceAdjustment: 0
        },
        {
          seatId: 2,
          theaterId: 1,
          seatNumber: 'A1',
          row: 'A',
          column: 1,
          isAvailable: true,
          isHandicapAccessible: false,
          priceAdjustment: 0
        }
      ];

      const result = service.mapSeatDtosToRows(seats);

      expect(result[0].row).toBe('A');
      expect(result[1].row).toBe('B');
    });

    it('should return empty array for empty input', () => {
      const result = service.mapSeatDtosToRows([]);
      expect(result).toEqual([]);
    });
  });

  describe('mapUiSeatToUpdateDto', () => {
    it('should map UI seat to update DTO correctly', () => {
      const seat: Seat = {
        id: '1',
        row: 'A',
        number: 1,
        type: 'handicap',
        status: 'available',
        price: 12,
        features: ['handicap']
      };

      const result = service.mapUiSeatToUpdateDto(seat, 1);

      expect(result.seatId).toBe(1);
      expect(result.isAvailable).toBe(true);
      expect(result.isHandicapAccessible).toBe(true);
      expect(result.priceAdjustment).toBe(0); // 12 - 12
    });

    it('should calculate price adjustment correctly', () => {
      const seat: Seat = {
        id: '2',
        row: 'B',
        number: 1,
        type: 'vip',
        status: 'available',
        price: 20,
        features: ['vip']
      };

      const result = service.mapUiSeatToUpdateDto(seat, 1);

      expect(result.priceAdjustment).toBe(8); // 20 - 12
    });
  });

  describe('calculateTotalPriceWithTax', () => {
    it('should calculate total price with tax correctly', () => {
      const selection = {
        seats: [
          { price: 12 } as Seat,
          { price: 15 } as Seat
        ],
        totalPrice: 27,
        totalSeats: 2
      };

      const result = service.calculateTotalPriceWithTax(selection);

      // 27 + (27 * 0.20) = 32.4
      expect(result).toBe(32.4);
    });
  });

  describe('generateDefaultLayout', () => {
    it('should generate default layout correctly', () => {
      const result = service.generateDefaultLayout(3, 4, 1);

      expect(result.length).toBe(3);
      expect(result[0].row).toBe('A');
      expect(result[0].seats.length).toBe(4);
      expect(result[1].row).toBe('B');
      expect(result[2].row).toBe('C');

      // Vérifier le premier siège
      const firstSeat = result[0].seats[0];
      expect(firstSeat.id).toBe('1-A1');
      expect(firstSeat.row).toBe('A');
      expect(firstSeat.number).toBe(1);
      expect(firstSeat.type).toBe('standard');
      expect(firstSeat.status).toBe('available');
      expect(firstSeat.price).toBe(12);
    });
  });

  describe('getSeatStatistics', () => {
    it('should calculate seat statistics correctly', () => {
      const seats: SeatDto[] = [
        // Available standard
        {
          seatId: 1,
          theaterId: 1,
          seatNumber: 'A1',
          row: 'A',
          column: 1,
          isAvailable: true,
          isHandicapAccessible: false,
          priceAdjustment: 0
        },
        // Occupied standard
        {
          seatId: 2,
          theaterId: 1,
          seatNumber: 'A2',
          row: 'A',
          column: 2,
          isAvailable: false,
          isHandicapAccessible: false,
          priceAdjustment: 0
        },
        // Available handicap
        {
          seatId: 3,
          theaterId: 1,
          seatNumber: 'B1',
          row: 'B',
          column: 1,
          isAvailable: true,
          isHandicapAccessible: true,
          priceAdjustment: 0
        },
        // Available VIP
        {
          seatId: 4,
          theaterId: 1,
          seatNumber: 'C1',
          row: 'C',
          column: 1,
          isAvailable: true,
          isHandicapAccessible: false,
          priceAdjustment: 6
        }
      ];

      const result = service.getSeatStatistics(seats);

      expect(result.total).toBe(4);
      expect(result.available).toBe(3);
      expect(result.occupied).toBe(1);
      expect(result.handicap).toBe(1);
      expect(result.vip).toBe(1);
    });
  });

  describe('validateDataConsistency', () => {
    it('should validate consistent data correctly', () => {
      const seatDto: SeatDto = {
        seatId: 1,
        theaterId: 1,
        seatNumber: 'A1',
        row: 'A',
        column: 1,
        isAvailable: true,
        isHandicapAccessible: false,
        priceAdjustment: 0
      };

      const seatUi: Seat = {
        id: '1',
        row: 'A',
        number: 1,
        type: 'standard',
        status: 'available',
        price: 12,
        features: []
      };

      const result = service.validateDataConsistency(seatDto, seatUi);

      expect(result).toBe(true);
    });

    it('should detect inconsistent data', () => {
      const seatDto: SeatDto = {
        seatId: 1,
        theaterId: 1,
        seatNumber: 'A1',
        row: 'A',
        column: 1,
        isAvailable: true,
        isHandicapAccessible: false,
        priceAdjustment: 0
      };

      const seatUi: Seat = {
        id: '2', // ID différent
        row: 'A',
        number: 1,
        type: 'standard',
        status: 'available',
        price: 12,
        features: []
      };

      const result = service.validateDataConsistency(seatDto, seatUi);

      expect(result).toBe(false);
    });
  });
});