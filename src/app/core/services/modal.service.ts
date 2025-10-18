import { Injectable, ComponentRef, Injector, createComponent, ApplicationRef, EnvironmentInjector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModalConfig {
  component: any;
  data?: any;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  backdrop?: boolean;
  closeOnBackdrop?: boolean;
}

export interface ModalInstance {
  id: string;
  componentRef: ComponentRef<any>;
  config: ModalConfig;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: ModalInstance[] = [];
  private modalSubject = new BehaviorSubject<ModalInstance[]>([]);

  constructor(
    private injector: Injector,
    private appRef: ApplicationRef,
    private environmentInjector: EnvironmentInjector
  ) {}

  /**
   * Ouvre une modal avec la configuration spécifiée
   */
  open(component: any, config: Partial<ModalConfig> = {}): string {
    const modalId = this.generateId();
    const fullConfig: ModalConfig = {
      component,
      data: config.data || {},
      size: config.size || 'md',
      backdrop: config.backdrop !== false,
      closeOnBackdrop: config.closeOnBackdrop !== false
    };

    // Création du composant modal
    const componentRef = createComponent(component, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.injector
    });

    // Passage des données au composant
    if (config.data) {
      Object.assign(componentRef.instance as object, config.data);
    }

    // Ajout au DOM
    document.body.appendChild(componentRef.location.nativeElement);
    this.appRef.attachView(componentRef.hostView);

    const modalInstance: ModalInstance = {
      id: modalId,
      componentRef,
      config: fullConfig
    };

    this.modals.push(modalInstance);
    this.modalSubject.next([...this.modals]);

    return modalId;
  }

  /**
   * Ferme une modal spécifique
   */
  close(modalId?: string): void {
    if (modalId) {
      const index = this.modals.findIndex(m => m.id === modalId);
      if (index !== -1) {
        this.destroyModal(this.modals[index]);
        this.modals.splice(index, 1);
      }
    } else if (this.modals.length > 0) {
      // Ferme la dernière modal
      const lastModal = this.modals.pop();
      if (lastModal) {
        this.destroyModal(lastModal);
      }
    }
    this.modalSubject.next([...this.modals]);
  }

  /**
   * Ferme toutes les modales
   */
  closeAll(): void {
    this.modals.forEach(modal => this.destroyModal(modal));
    this.modals = [];
    this.modalSubject.next([]);
  }

  /**
   * Récupère la modal active
   */
  getActiveModal(): ModalInstance | null {
    return this.modals.length > 0 ? this.modals[this.modals.length - 1] : null;
  }

  /**
   * Observable des modales actives
   */
  getModals(): Observable<ModalInstance[]> {
    return this.modalSubject.asObservable();
  }

  /**
   * Vérifie si une modal est ouverte
   */
  isOpen(modalId?: string): boolean {
    if (modalId) {
      return this.modals.some(m => m.id === modalId);
    }
    return this.modals.length > 0;
  }

  /**
   * Met à jour les données d'une modal
   */
  updateData(modalId: string, data: any): void {
    const modal = this.modals.find(m => m.id === modalId);
    if (modal) {
      Object.assign(modal.componentRef.instance, data);
      modal.config.data = { ...modal.config.data, ...data };
    }
  }

  private destroyModal(modal: ModalInstance): void {
    // Appel de la méthode onClose si elle existe
    if (modal.componentRef.instance.onClose) {
      modal.componentRef.instance.onClose();
    }

    // Détachement du DOM
    this.appRef.detachView(modal.componentRef.hostView);
    modal.componentRef.destroy();
  }

  private generateId(): string {
    return `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}