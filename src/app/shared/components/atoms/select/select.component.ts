import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, HostListener, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export type SelectSize = 'small' | 'medium' | 'large';
export type ValidationState = 'valid' | 'invalid' | 'none';

@Component({
  selector: 'app-select',
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'], 
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() size: SelectSize = 'medium';
  @Input() placeholder: string = 'Sélectionnez une option';
  @Input() label: string = '';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() validationState: ValidationState = 'none';
  @Input() errorMessage: string = '';
  @Input() helperText: string = '';
  @Input() prefixIcon: string = '';
  
  @Output() valueChange = new EventEmitter<any>();
  @Output() blur = new EventEmitter<FocusEvent>();
  @Output() focus = new EventEmitter<FocusEvent>();

  value: any = '';
  isFocused: boolean = false;
  isOpen: boolean = false;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  get selectClasses(): string {
    const classes = [
      'select',
      `select--${this.size}`,
      this.validationState !== 'none' ? `select--${this.validationState}` : '',
      this.disabled ? 'select--disabled' : '',
      this.isFocused ? 'select--focused' : '',
      this.isOpen ? 'select--open' : '',
      this.prefixIcon ? 'select--has-prefix' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  get selectedOption(): SelectOption | undefined {
    return this.options.find(option => option.value === this.value);
  }

  get displayValue(): string {
    return this.selectedOption?.label || this.placeholder;
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  selectOption(option: SelectOption): void {
    if (!option.disabled) {
      this.value = option.value;
      this.onChange(this.value);
      this.valueChange.emit(this.value);
      this.isOpen = false;
    }
  }

  getOptionClasses(option: SelectOption): string {
    const classes = [
      'select__option',
      option.value === this.value ? 'select__option--selected' : '',
      option.disabled ? 'select__option--disabled' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  onInputBlur(event: FocusEvent): void {
    this.isFocused = false;
    this.onTouched();
    this.blur.emit(event);
  }

  onInputFocus(event: FocusEvent): void {
    this.isFocused = true;
    this.focus.emit(event);
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Fermer le dropdown si on clique en dehors
    if (this.isOpen) {
      const target = event.target as HTMLElement;
      const clickedInside = target.closest('.select-container');
      
      if (!clickedInside) {
        this.closeDropdown();
      }
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
