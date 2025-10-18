import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type QRCodeSize = 'small' | 'medium' | 'large' | 'xl';
export type QRCodeErrorCorrection = 'L' | 'M' | 'Q' | 'H';

@Component({
  selector: 'app-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class QRCodeComponent implements OnChanges {
  @Input() data: string = '';
  @Input() size: QRCodeSize = 'medium';
  @Input() errorCorrection: QRCodeErrorCorrection = 'M';
  @Input() margin: number = 4;
  @Input() darkColor: string = '#000000';
  @Input() lightColor: string = '#ffffff';
  @Input() showDownload: boolean = false;
  @Input() downloadLabel: string = 'Télécharger QR Code';

  qrCodeDataUrl: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['errorCorrection'] || changes['margin'] || 
        changes['darkColor'] || changes['lightColor']) {
      this.generateQRCode();
    }
  }

  private generateQRCode(): void {
    if (!this.data) {
      this.qrCodeDataUrl = '';
      return;
    }

    try {
      // Simulation de génération de QR Code
      // Dans une implémentation réelle, on utiliserait une bibliothèque comme qrcode
      this.generateMockQRCode();
    } catch (error) {
      console.error('Erreur lors de la génération du QR Code:', error);
      this.qrCodeDataUrl = '';
    }
  }

  private generateMockQRCode(): void {
    // Cette méthode simule la génération d'un QR Code
    // Dans une implémentation réelle, on utiliserait une vraie bibliothèque QR Code
    const canvas = document.createElement('canvas');
    const size = this.getCanvasSize();
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fond blanc
    ctx.fillStyle = this.lightColor;
    ctx.fillRect(0, 0, size, size);

    // Dessiner un motif QR Code simulé (carrés noirs)
    ctx.fillStyle = this.darkColor;
    const moduleSize = Math.floor(size / 21); // 21 modules pour un QR Code simple
    
    // Dessiner des carrés pour simuler un QR Code
    for (let y = 0; y < 21; y++) {
      for (let x = 0; x < 21; x++) {
        // Simuler un motif QR Code aléatoire mais cohérent basé sur les données
        const shouldFill = this.getModuleState(x, y, this.data);
        if (shouldFill) {
          ctx.fillRect(
            x * moduleSize + this.margin,
            y * moduleSize + this.margin,
            moduleSize,
            moduleSize
          );
        }
      }
    }

    this.qrCodeDataUrl = canvas.toDataURL('image/png');
  }

  private getModuleState(x: number, y: number, data: string): boolean {
    // Simulation simple d'un motif QR Code basé sur les données
    // Dans une vraie implémentation, on utiliserait un algorithme QR Code
    const hash = this.simpleHash(data + x + y);
    return hash % 2 === 0;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir en 32-bit integer
    }
    return Math.abs(hash);
  }

  private getCanvasSize(): number {
    const sizeMap = {
      'small': 128,
      'medium': 256,
      'large': 384,
      'xl': 512
    };
    return sizeMap[this.size] || 256;
  }

  get qrCodeClasses(): string {
    const classes = [
      'qr-code',
      `qr-code--${this.size}`
    ];
    
    return classes.filter(c => c).join(' ');
  }

  downloadQRCode(): void {
    if (!this.qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = this.qrCodeDataUrl;
    link.download = `qrcode-${this.data.substring(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  copyToClipboard(): void {
    if (!this.qrCodeDataUrl) return;

    // Créer un élément temporaire pour copier l'URL de l'image
    const textArea = document.createElement('textarea');
    textArea.value = this.data;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Dans une vraie application, on pourrait afficher un message de confirmation
    console.log('Données copiées dans le presse-papier:', this.data);
  }
}
