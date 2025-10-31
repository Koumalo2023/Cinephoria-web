import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type DatePickerSize = 'small' | 'medium' | 'large';
export type DatePickerVariant = 'primary' | 'secondary' | 'outline';
export type DateTimeMode = 'date' | 'datetime';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() label: string = 'Date';
  @Input() placeholder: string = 'Sélectionnez une date';
  @Input() size: DatePickerSize = 'medium';
  @Input() variant: DatePickerVariant = 'primary';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() minDate: string = '';
  @Input() maxDate: string = '';
  @Input() showClear: boolean = true;
  @Input() format: string = 'YYYY-MM-DD';
  @Input() mode: DateTimeMode = 'date';
  
  @Output() dateChange = new EventEmitter<string>();

  value: string = '';
  isOpen: boolean = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get datePickerClasses(): string {
    const classes = [
      'date-picker',
      `date-picker--${this.size}`,
      `date-picker--${this.variant}`,
      this.disabled ? 'date-picker--disabled' : '',
      this.isOpen ? 'date-picker--open' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  get displayValue(): string {
    if (!this.value) return this.placeholder;
    
    try {
      const date = new Date(this.value);
      return this.formatDate(date);
    } catch {
      return this.value;
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return this.format
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day);
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.dateChange.emit(this.value);
  }

  onCalendarClick(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  clearDate(): void {
    if (!this.disabled) {
      this.value = '';
      this.onChange(this.value);
      this.dateChange.emit(this.value);
    }
  }

  onBlur(): void {
    this.isOpen = false;
    this.onTouched();
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

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  get minDateAttr(): string {
    return this.minDate || '';
  }

  get maxDateAttr(): string {
    return this.maxDate || '';
  }

  get isClearable(): boolean {
    return this.showClear && !!this.value && !this.disabled;
  }
}
