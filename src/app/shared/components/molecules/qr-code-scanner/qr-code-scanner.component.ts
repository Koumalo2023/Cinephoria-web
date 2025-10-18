import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { SpinnerComponent } from '../../atoms/spinner/spinner.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

@Component({
  selector: 'app-qr-code-scanner',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent, SpinnerComponent, BadgeComponent],
  templateUrl: './qr-code-scanner.component.html',
  styleUrl: './qr-code-scanner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrCodeScannerComponent implements AfterViewInit, OnDestroy {
  @Input() title = 'Scanner QR Code';
  @Input() description = 'Scannez le QR code pour valider votre réservation';
  @Input() showScanner = false;
  @Input() isScanning = false;
  @Input() lastScannedCode: string | null = null;
  @Input() scanHistory: Array<{ code: string; timestamp: Date; valid: boolean }> = [];
  
  @Output() scanStarted = new EventEmitter<void>();
  @Output() scanStopped = new EventEmitter<void>();
  @Output() codeScanned = new EventEmitter<string>();
  @Output() scanError = new EventEmitter<string>();

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private isDestroyed = false;

  get hasCameraAccess(): boolean {
    return !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
  }

  get canStartScanning(): boolean {
    return this.hasCameraAccess && !this.isScanning;
  }

  ngAfterViewInit(): void {
    if (this.showScanner) {
      this.startScanning();
    }
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.stopScanning();
  }

  async toggleScanning(): Promise<void> {
    if (this.isScanning) {
      this.stopScanning();
      this.scanStopped.emit();
    } else {
      await this.startScanning();
      this.scanStarted.emit();
    }
  }

  async startScanning(): Promise<void> {
    if (!this.hasCameraAccess) {
      this.scanError.emit('Accès à la caméra non disponible');
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
        await this.videoElement.nativeElement.play();
        this.isScanning = true;
        this.startScanLoop();
      }
    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      this.scanError.emit('Impossible d\'accéder à la caméra');
    }
  }

  stopScanning(): void {
    this.isScanning = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement?.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
  }

  private startScanLoop(): void {
    if (this.isDestroyed || !this.isScanning) return;

    const scanFrame = () => {
      if (!this.isScanning || this.isDestroyed) return;

      try {
        this.processFrame();
        this.animationFrameId = requestAnimationFrame(scanFrame);
      } catch (error) {
        console.error('Erreur lors du scan:', error);
        this.scanError.emit('Erreur lors du scan du QR code');
      }
    };

    this.animationFrameId = requestAnimationFrame(scanFrame);
  }

  private processFrame(): void {
    // Simulation de la détection de QR code
    // Dans une implémentation réelle, on utiliserait une bibliothèque comme jsQR
    if (Math.random() < 0.01) { // 1% de chance de détection simulée
      const simulatedCode = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
      this.onCodeDetected(simulatedCode);
    }
  }

  private onCodeDetected(code: string): void {
    if (!this.isScanning) return;

    this.codeScanned.emit(code);
    this.lastScannedCode = code;
    
    // Ajouter à l'historique
    this.scanHistory.unshift({
      code,
      timestamp: new Date(),
      valid: this.validateCode(code)
    });

    // Limiter l'historique à 10 entrées
    if (this.scanHistory.length > 10) {
      this.scanHistory = this.scanHistory.slice(0, 10);
    }
  }

  validateCode(code: string): boolean {
    // Logique de validation simple
    return code.startsWith('RES-') && code.length > 10;
  }

  formatTimestamp(timestamp: Date): string {
    return timestamp.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  copyToClipboard(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      // Optionnel: Afficher un message de succès
      console.log('Code copié dans le presse-papier');
    }).catch(err => {
      console.error('Erreur lors de la copie:', err);
    });
  }

  clearHistory(): void {
    this.scanHistory = [];
  }

  trackByScan(index: number, scan: any): string {
    return scan.code + scan.timestamp.getTime();
  }
}
