import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export type RadioSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true
    }
  ]
})
export class RadioComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() value: any;
  @Input() size: RadioSize = 'medium';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() name: string = '';
  
  @Output() valueChange = new EventEmitter<any>();

  selectedValue: any = null;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  get radioClasses(): string {
    const classes = [
      'radio',
      `radio--${this.size}`,
      this.disabled ? 'radio--disabled' : '',
      this.isChecked ? 'radio--checked' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  get isChecked(): boolean {
    return this.selectedValue === this.value;
  }

  select(): void {
    if (!this.disabled) {
      this.selectedValue = this.value;
      this.onChange(this.selectedValue);
      this.valueChange.emit(this.selectedValue);
      this.onTouched();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.select();
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.selectedValue = value || null;
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
