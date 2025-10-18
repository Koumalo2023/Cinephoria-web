import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

export interface ModalConfig {
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  backdrop?: boolean | 'static';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  footerActions?: ModalAction[];
  maxWidth?: string;
  maxHeight?: string;
  customClass?: string;
}

export interface ModalAction {
  label: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  handler?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent
  ],
  templateUrl: './modal-container.component.html',
  styleUrls: ['./modal-container.component.scss']
})
export class ModalContainerComponent implements AfterViewInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() config: ModalConfig = {};
  @Input() loading: boolean = false;
  @Input() disableScroll: boolean = true;
  
  @Output() closed = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();
  @Output() backdropClick = new EventEmitter<void>();
  
  @ViewChild('modalContent') modalContent!: ElementRef<HTMLElement>;
  @ViewChild('modalDialog') modalDialog!: ElementRef<HTMLElement>;
  
  private scrollPosition: number = 0;
  private originalBodyOverflow: string = '';
  
  ngAfterViewInit() {
    if (this.isOpen) {
      this.handleOpen();
    }
  }
  
  ngOnDestroy() {
    this.restoreBodyScroll();
  }
  
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.isOpen && this.config.closeOnEscape !== false) {
      this.close();
      event.preventDefault();
    }
  }
  
  open(): void {
    this.isOpen = true;
    this.handleOpen();
    this.opened.emit();
  }
  
  close(): void {
    if (this.config.backdrop === 'static') {
      // Animation de secousse pour indiquer que la modal ne peut pas être fermée
      this.shakeModal();
      return;
    }
    
    this.isOpen = false;
    this.handleClose();
    this.closed.emit();
  }
  
  private handleOpen(): void {
    if (this.disableScroll) {
      this.disableBodyScroll();
    }
    
    // Focus sur le contenu de la modal pour l'accessibilité
    setTimeout(() => {
      if (this.modalContent) {
        this.modalContent.nativeElement.focus();
      }
    }, 100);
  }
  
  private handleClose(): void {
    this.restoreBodyScroll();
  }
  
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && this.config.closeOnBackdrop !== false) {
      this.backdropClick.emit();
      this.close();
    }
  }
  
  onActionClick(action: ModalAction): void {
    if (action.handler && !action.disabled && !action.loading) {
      action.handler();
    }
  }
  
  private disableBodyScroll(): void {
    this.scrollPosition = window.pageYOffset;
    this.originalBodyOverflow = document.body.style.overflow;
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.scrollPosition}px`;
    document.body.style.width = '100%';
  }
  
  private restoreBodyScroll(): void {
    document.body.style.overflow = this.originalBodyOverflow;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    if (this.scrollPosition) {
      window.scrollTo(0, this.scrollPosition);
    }
  }
  
  private shakeModal(): void {
    const dialog = this.modalDialog?.nativeElement;
    if (dialog) {
      dialog.classList.add('modal-shake');
      setTimeout(() => {
        dialog.classList.remove('modal-shake');
      }, 500);
    }
  }
  
  // Méthodes utilitaires pour les classes CSS
  getModalClasses(): string[] {
    const classes = ['modal'];
    
    if (this.isOpen) {
      classes.push('modal-open');
    }
    
    if (this.config.customClass) {
      classes.push(this.config.customClass);
    }
    
    return classes;
  }
  
  getBackdropClasses(): string[] {
    const classes = ['modal-backdrop'];
    
    if (this.isOpen) {
      classes.push('modal-backdrop-open');
    }
    
    if (this.config.backdrop === false) {
      classes.push('modal-backdrop-hidden');
    }
    
    return classes;
  }
  
  getDialogClasses(): string[] {
    const classes = ['modal-dialog'];
    
    // Taille
    classes.push(`modal-size-${this.config.size || 'md'}`);
    
    // Position
    classes.push(`modal-position-${this.config.position || 'center'}`);
    
    return classes;
  }
  
  getContentClasses(): string[] {
    const classes = ['modal-content'];
    
    if (this.loading) {
      classes.push('modal-content-loading');
    }
    
    return classes;
  }
  
  getHeaderClasses(): string[] {
    const classes = ['modal-header'];
    
    if (!this.config.title && !this.config.subtitle) {
      classes.push('modal-header-minimal');
    }
    
    return classes;
  }
  
  // Getters pour les valeurs par défaut
  get showHeader(): boolean {
    return this.config.showHeader !== false;
  }
  
  get showFooter(): boolean {
    return this.config.showFooter !== false && ((this.config.footerActions?.length || 0) > 0 || this.config.showFooter === true);
  }
  
  get showCloseButton(): boolean {
    return this.config.showCloseButton !== false;
  }
  
  get hasBackdrop(): boolean {
    return this.config.backdrop !== false;
  }
  
  get footerActions(): ModalAction[] {
    return this.config.footerActions || [];
  }
  
  // Styles dynamiques
  getDialogStyles(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    
    if (this.config.maxWidth) {
      styles['max-width'] = this.config.maxWidth;
    }
    
    if (this.config.maxHeight) {
      styles['max-height'] = this.config.maxHeight;
    }
    
    return styles;
  }
  
  // Accessibilité
  getAriaLabelledBy(): string | null {
    return this.config.title ? 'modal-title' : null;
  }
  
  getButtonVariant(actionVariant: string): 'primary' | 'secondary' | 'ghost' | 'danger' {
    const variantMap: { [key: string]: 'primary' | 'secondary' | 'ghost' | 'danger' } = {
      'primary': 'primary',
      'secondary': 'secondary',
      'success': 'primary',
      'warning': 'danger',
      'error': 'danger',
      'outline': 'ghost'
    };
    
    return variantMap[actionVariant] || 'primary';
  }

  getAriaDescribedBy(): string | null {
    return this.config.subtitle ? 'modal-description' : null;
  }
}
