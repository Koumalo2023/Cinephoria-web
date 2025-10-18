import { Component, Input, Output, EventEmitter, forwardRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type TimePickerSize = 'small' | 'medium' | 'large';
export type TimePickerVariant = 'primary' | 'secondary' | 'outline';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true
    }
  ]
})
export class TimePickerComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'HH:MM';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() size: TimePickerSize = 'medium';
  @Input() variant: TimePickerVariant = 'primary';
  @Input() minTime: string = '';
  @Input() maxTime: string = '';
  @Input() step: number = 900; // 15 minutes par défaut
  @Input() showSeconds: boolean = false;
  @Input() clearable: boolean = true;

  @Output() timeChange = new EventEmitter<string>();

  value: string = '';
  isOpen: boolean = false;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // Classes CSS
  get wrapperClasses(): string {
    return [
      'time-picker__input-wrapper',
      `time-picker--${this.size}`,
      `time-picker--${this.variant}`,
      this.disabled ? 'time-picker--disabled' : '',
      this.isOpen ? 'time-picker--open' : ''
    ].join(' ').trim();
  }

  // Vérifier si le bouton clear doit être affiché
  get isClearable(): boolean {
    return this.clearable && !!this.value && !this.disabled;
  }

  // Formater l'heure pour l'affichage
  get displayValue(): string {
    if (!this.value) return '';
    
    const [hours, minutes, seconds] = this.value.split(':');
    if (this.showSeconds) {
      return `${hours}:${minutes}:${seconds}`;
    }
    return `${hours}:${minutes}`;
  }

  // Ouvrir/fermer le sélecteur
  togglePicker(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.onTouched();
      }
    }
  }

  // Gérer la sélection d'heure
  onTimeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.timeChange.emit(this.value);
    this.isOpen = false;
  }

  // Effacer la valeur
  clearTime(): void {
    if (!this.disabled) {
      this.value = '';
      this.onChange('');
      this.timeChange.emit('');
    }
  }

  // Fermer le sélecteur quand on clique en dehors
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.time-picker-wrapper')) {
      this.isOpen = false;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
