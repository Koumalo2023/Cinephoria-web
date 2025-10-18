import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export type RatingSize = 'small' | 'medium' | 'large';
export type RatingVariant = 'primary' | 'secondary' | 'warning';

@Component({
  selector: 'app-rating-input',
  templateUrl: './rating-input.component.html',
  styleUrls: ['./rating-input.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingInputComponent),
      multi: true
    }
  ]
})
export class RatingInputComponent implements ControlValueAccessor {
  @Input() maxRating: number = 5;
  @Input() size: RatingSize = 'medium';
  @Input() variant: RatingVariant = 'primary';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() showLabel: boolean = true;
  @Input() label: string = 'Note';
  @Input() showValue: boolean = false;
  
  @Output() ratingChange = new EventEmitter<number>();

  value: number = 0;
  hoverValue: number = 0;

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  get ratingClasses(): string {
    const classes = [
      'rating-input',
      `rating-input--${this.size}`,
      `rating-input--${this.variant}`,
      this.disabled ? 'rating-input--disabled' : '',
      this.readonly ? 'rating-input--readonly' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  get stars(): number[] {
    return Array.from({ length: this.maxRating }, (_, i) => i + 1);
  }

  get displayValue(): string {
    if (this.value === 0) return 'Non noté';
    return `${this.value}/${this.maxRating}`;
  }

  get isInteractive(): boolean {
    return !this.disabled && !this.readonly;
  }

  setRating(rating: number): void {
    if (!this.isInteractive) return;

    this.value = rating;
    this.onChange(this.value);
    this.onTouched();
    this.ratingChange.emit(this.value);
  }

  setHoverValue(rating: number): void {
    if (!this.isInteractive) return;
    this.hoverValue = rating;
  }

  clearHover(): void {
    this.hoverValue = 0;
  }

  getStarState(star: number): 'full' | 'half' | 'empty' {
    if (this.hoverValue > 0) {
      return star <= this.hoverValue ? 'full' : 'empty';
    }
    
    if (this.value >= star) {
      return 'full';
    }
    
    if (this.value > star - 1) {
      return 'half';
    }
    
    return 'empty';
  }

  getStarIcon(star: number): string {
    const state = this.getStarState(star);
    
    switch (state) {
      case 'full':
        return 'fas fa-star';
      case 'half':
        return 'fas fa-star-half-alt';
      default:
        return 'far fa-star';
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: number): void {
    this.value = value || 0;
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
