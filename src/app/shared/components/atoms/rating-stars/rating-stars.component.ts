import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type RatingStarsSize = 'small' | 'medium' | 'large';
export type RatingStarsVariant = 'primary' | 'secondary' | 'warning';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingStarsComponent),
      multi: true
    }
  ]
})
export class RatingStarsComponent implements ControlValueAccessor {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;
  @Input() size: RatingStarsSize = 'medium';
  @Input() variant: RatingStarsVariant = 'primary';
  @Input() interactive: boolean = false;
  @Input() showValue: boolean = false;
  @Input() disabled: boolean = false;

  @Output() ratingChange = new EventEmitter<number>();

  hoverRating: number = 0;
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  // Classes CSS
  get containerClasses(): string {
    return [
      'rating-stars',
      `rating-stars--${this.size}`,
      `rating-stars--${this.variant}`,
      this.interactive ? 'rating-stars--interactive' : '',
      this.disabled ? 'rating-stars--disabled' : ''
    ].join(' ').trim();
  }

  // Générer les étoiles
  get stars(): number[] {
    return Array.from({ length: this.maxRating }, (_, i) => i + 1);
  }

  // Obtenir le pourcentage de remplissage pour une étoile
  getStarFill(starIndex: number): number {
    const currentRating = this.hoverRating || this.rating;
    const fill = currentRating - starIndex + 1;
    
    if (fill >= 1) return 100;
    if (fill <= 0) return 0;
    return fill * 100;
  }

  // Gérer le survol
  onStarHover(starIndex: number): void {
    if (this.interactive && !this.disabled) {
      this.hoverRating = starIndex;
    }
  }

  // Gérer la sortie du survol
  onStarLeave(): void {
    if (this.interactive && !this.disabled) {
      this.hoverRating = 0;
    }
  }

  // Gérer le clic
  onStarClick(starIndex: number): void {
    if (this.interactive && !this.disabled) {
      this.rating = starIndex;
      this.onChange(this.rating);
      this.ratingChange.emit(this.rating);
      this.onTouched();
    }
  }

  // Obtenir la couleur en fonction du rating
  get ratingColor(): string {
    if (this.rating >= 4) return 'rating--excellent';
    if (this.rating >= 3) return 'rating--good';
    if (this.rating >= 2) return 'rating--average';
    return 'rating--poor';
  }

  // Formater la valeur affichée
  get formattedValue(): string {
    return this.rating.toFixed(1);
  }

  // ControlValueAccessor implementation
  writeValue(value: number): void {
    this.rating = value || 0;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}