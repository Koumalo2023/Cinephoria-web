import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, Injectable, Injector } from '@angular/core';
import { ReservationDetailsModalComponent } from 'src/app/features/user/mes-reservations/reservation-details-modal/reservation-details-modal.component';
import { UserReservationDto } from '../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ReservationModalService {
  private modalComponentRef: ComponentRef<ReservationDetailsModalComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector
  ) {}

  /**
   * Ouvrir la modale de détails de réservation
   */
  openReservationModal(reservation: UserReservationDto): void {
    // Vérifier si une modale est déjà ouverte
    if (this.modalComponentRef) {
      this.closeModal();
    }

    // Créer le composant de modale
    this.modalComponentRef = createComponent(ReservationDetailsModalComponent, {
      environmentInjector: this.environmentInjector
    });
    
    // Définir les données de la réservation
    this.modalComponentRef.instance.reservation = reservation;
    
    // Attacher le composant à l'application
    this.appRef.attachView(this.modalComponentRef.hostView);
    
    // Ajouter l'élément DOM au body avec l'overlay
    const domElem = this.modalComponentRef.location.nativeElement;
    const overlay = this.createOverlay();
    overlay.appendChild(domElem);
    document.body.appendChild(overlay);
    
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
    
    // Gérer la fermeture via l'output
    this.modalComponentRef.instance.close.subscribe(() => {
      this.closeModal();
    });
    
    // Gérer la fermeture avec Escape
    this.addEscapeListener();
    
    // Gérer la fermeture en cliquant sur l'overlay
    this.addOverlayClickListener(overlay);
  }

  /**
   * Créer l'overlay de la modale
   */
  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    `;
    return overlay;
  }

  /**
   * Fermer la modale
   */
  closeModal(): void {
    if (this.modalComponentRef) {
      // Détacher la vue
      this.appRef.detachView(this.modalComponentRef.hostView);
      
      // Supprimer l'élément DOM
      const overlay = document.querySelector('.modal-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
      
      // Détruire le composant
      this.modalComponentRef.destroy();
      this.modalComponentRef = null;
      
      // Restaurer le scroll du body
      document.body.style.overflow = '';
      
      // Supprimer le listener Escape
      this.removeEscapeListener();
    }
  }

  /**
   * Ajouter le listener pour la touche Escape
   */
  private addEscapeListener(): void {
    const escapeHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.closeModal();
      }
    };
    
    document.addEventListener('keydown', escapeHandler);
    
    // Stocker la référence pour pouvoir la supprimer
    (this as any)._escapeHandler = escapeHandler;
  }

  /**
   * Supprimer le listener Escape
   */
  private removeEscapeListener(): void {
    const escapeHandler = (this as any)._escapeHandler;
    if (escapeHandler) {
      document.removeEventListener('keydown', escapeHandler);
      (this as any)._escapeHandler = null;
    }
  }

  /**
   * Ajouter le listener pour le clic sur l'overlay
   */
  private addOverlayClickListener(overlay: HTMLElement): void {
    const clickHandler = (event: MouseEvent) => {
      if (event.target === overlay) {
        this.closeModal();
      }
    };
    
    overlay.addEventListener('click', clickHandler);
    
    // Stocker la référence pour pouvoir la supprimer
    (this as any)._overlayClickHandler = clickHandler;
  }

  /**
   * Vérifier si une modale est ouverte
   */
  isModalOpen(): boolean {
    return this.modalComponentRef !== null;
  }
  /**
   * Ouvre une modale de réservation pour un film
   */
  openMovieReservationModal(data: { showtime: any; movie: any }): void {
    // Pour l'instant, on utilise simplement la méthode existante avec des données vides
    // Cette méthode sera implémentée plus tard avec le composant de réservation approprié
    const placeholderReservation: UserReservationDto = {
      reservationId: 0,
      movieTitle: data.movie?.title || 'Film',
      showtimeDate: data.showtime?.startTime || new Date(),
      theaterName: 'Cinéma',
      seatNumbers: [],
      totalPrice: data.showtime?.price || 0,
      status: 'confirmed',
      createdAt: new Date(),
      qrCodeData: ''
    };
    
    this.openReservationModal(placeholderReservation);
  }
}