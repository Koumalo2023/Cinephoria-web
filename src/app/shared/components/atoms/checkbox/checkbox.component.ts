import { Component, Input, Output, EventEmitter, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export type CheckboxSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent implements ControlValueAccessor, OnChanges {
  @Input() label: string = '';
  @Input() size: CheckboxSize = 'medium';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() indeterminate: boolean = false;
  @Input() value: boolean = false;
  
  @Output() valueChange = new EventEmitter<boolean>();

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  get checkboxClasses(): string {
    const classes = [
      'checkbox',
      `checkbox--${this.size}`,
      this.disabled ? 'checkbox--disabled' : '',
      this.indeterminate ? 'checkbox--indeterminate' : '',
      this.value ? 'checkbox--checked' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  toggle(): void {
    if (!this.disabled) {
      this.value = !this.value;
      this.onChange(this.value);
      this.valueChange.emit(this.value);
      this.onTouched();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Synchroniser la valeur interne avec l'input
    if (changes['value'] && changes['value'].currentValue !== undefined) {
      this.onChange(changes['value'].currentValue);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.value = value || false;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
