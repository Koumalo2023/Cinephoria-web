import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type FilterToggleSize = 'small' | 'medium' | 'large';
export type FilterToggleVariant = 'primary' | 'secondary' | 'outline';

@Component({
  selector: 'app-filter-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-toggle.component.html',
  styleUrls: ['./filter-toggle.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterToggleComponent),
      multi: true
    }
  ]
})
export class FilterToggleComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() disabled: boolean = false;
  @Input() size: FilterToggleSize = 'medium';
  @Input() variant: FilterToggleVariant = 'primary';
  @Input() checked: boolean = false;
  @Input() showCount: boolean = false;
  @Input() count: number = 0;
  @Input() icon?: string;

  @Output() toggleChange = new EventEmitter<boolean>();

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  // Classes CSS
  get wrapperClasses(): string {
    return [
      'filter-toggle__wrapper',
      `filter-toggle--${this.size}`,
      `filter-toggle--${this.variant}`,
      this.checked ? 'filter-toggle--checked' : '',
      this.disabled ? 'filter-toggle--disabled' : ''
    ].join(' ').trim();
  }

  // Gérer le toggle
  onToggle(): void {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.onChange(this.checked);
      this.toggleChange.emit(this.checked);
      this.onTouched();
    }
  }

  // Gérer les événements clavier
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onToggle();
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked = !!value;
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
