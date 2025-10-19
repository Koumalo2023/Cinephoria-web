import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from '../../atoms/qr-code/qr-code.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';

export type QRCodeDisplaySize = 'small' | 'medium' | 'large';
export type QRCodeDisplayVariant = 'default' | 'card' | 'minimal';

export interface QRCodeDisplayConfig {
  title?: string;
  description?: string;
  showActions?: boolean;
  showCopy?: boolean;
  showDownload?: boolean;
  showShare?: boolean;
  showRefresh?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // en millisecondes
}

@Component({
  selector: 'app-qr-code-display',
  templateUrl: './qr-code-display.component.html',
  styleUrls: ['./qr-code-display.component.scss'],
  standalone: true,
  imports: [CommonModule, QRCodeComponent, ButtonComponent, IconComponent]
})
export class QRCodeDisplayComponent {
  @Input() data: string = '';
  @Input() title: string = 'QR Code';
  @Input() description: string = '';
  @Input() size: QRCodeDisplaySize = 'medium';
  @Input() variant: QRCodeDisplayVariant = 'default';
  @Input() config: QRCodeDisplayConfig = {};
  @Input() qrCodeSize: 'small' | 'medium' | 'large' | 'xl' = 'medium';
  @Input() errorCorrection: 'L' | 'M' | 'Q' | 'H' = 'M';
  @Input() margin: number = 4;
  @Input() darkColor: string = '#000000';
  @Input() lightColor: string = '#ffffff';

  @Output() copied = new EventEmitter<string>();
  @Output() downloaded = new EventEmitter<string>();
  @Output() shared = new EventEmitter<string>();
  @Output() refreshed = new EventEmitter<void>();

  // Classes CSS pour le conteneur
  get containerClasses(): string {
    const classes = [
      'qr-code-display',
      `qr-code-display--${this.size}`,
      `qr-code-display--${this.variant}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour le contenu
  get contentClasses(): string {
    const classes = [
      'qr-code-display__content',
      `qr-code-display__content--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Classes CSS pour les actions
  get actionsClasses(): string {
    const classes = [
      'qr-code-display__actions',
      `qr-code-display__actions--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Configuration fusionnée
  get mergedConfig(): QRCodeDisplayConfig {
    return {
      title: this.title,
      description: this.description,
      showActions: true,
      showCopy: true,
      showDownload: true,
      showShare: false,
      showRefresh: false,
      autoRefresh: false,
      refreshInterval: 30000,
      ...this.config
    };
  }

  // Vérifier si le composant a un titre
  get hasTitle(): boolean {
    return !!this.mergedConfig.title;
  }

  // Vérifier si le composant a une description
  get hasDescription(): boolean {
    return !!this.mergedConfig.description;
  }

  // Vérifier si le composant a des actions
  get hasActions(): boolean {
    return !!this.mergedConfig.showActions && (
      !!this.mergedConfig.showCopy ||
      !!this.mergedConfig.showDownload ||
      !!this.mergedConfig.showShare ||
      !!this.mergedConfig.showRefresh
    );
  }

  // Copier les données dans le presse-papier
  copyToClipboard(): void {
    if (!this.data) return;

    navigator.clipboard.writeText(this.data).then(() => {
      this.copied.emit(this.data);
      // Optionnel: Afficher un message de confirmation
      console.log('Données copiées dans le presse-papier:', this.data);
    }).catch(err => {
      console.error('Erreur lors de la copie:', err);
    });
  }

  // Télécharger le QR Code
  downloadQRCode(): void {
    if (!this.data) return;
    
    this.downloaded.emit(this.data);
    // L'action de téléchargement sera gérée par le composant QRCode enfant
  }

  // Partager le QR Code
  shareQRCode(): void {
    if (!this.data) return;

    if (navigator.share) {
      navigator.share({
        title: this.mergedConfig.title || 'QR Code',
        text: this.mergedConfig.description || '',
        url: this.data
      }).then(() => {
        this.shared.emit(this.data);
      }).catch(err => {
        console.error('Erreur lors du partage:', err);
      });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Share
      this.copyToClipboard();
    }
  }

  // Rafraîchir le QR Code
  refreshQRCode(): void {
    this.refreshed.emit();
  }

  // Obtenir la taille du QR Code en fonction de la taille d'affichage
  getQRCodeSize(): 'small' | 'medium' | 'large' | 'xl' {
    const sizeMap: { [key in QRCodeDisplaySize]: 'small' | 'medium' | 'large' | 'xl' } = {
      'small': 'small',
      'medium': 'medium',
      'large': 'large'
    };
    return sizeMap[this.size] || 'medium';
  }

  // Obtenir les classes pour le titre
  get titleClasses(): string {
    const classes = [
      'qr-code-display__title',
      `qr-code-display__title--${this.size}`
    ];
    return classes.join(' ').trim();
  }

  // Obtenir les classes pour la description
  get descriptionClasses(): string {
    const classes = [
      'qr-code-display__description',
      `qr-code-display__description--${this.size}`
    ];
    return classes.join(' ').trim();
  }
}
