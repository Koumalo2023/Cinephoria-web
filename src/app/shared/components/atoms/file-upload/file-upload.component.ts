import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export type FileUploadSize = 'small' | 'medium' | 'large';
export type FileUploadVariant = 'primary' | 'secondary' | 'outline';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input() accept: string = 'image/*';
  @Input() multiple: boolean = false;
  @Input() size: FileUploadSize = 'medium';
  @Input() variant: FileUploadVariant = 'primary';
  @Input() disabled: boolean = false;
  @Input() maxFileSize: number = 5 * 1024 * 1024; // 5MB par défaut
  @Input() showPreview: boolean = true;
  @Input() label: string = 'Choisir un fichier';
  @Input() helperText: string = '';
  
  @Output() fileSelected = new EventEmitter<File[]>();
  @Output() fileError = new EventEmitter<string>();

  files: File[] = [];
  previewUrls: string[] = [];
  isDragging: boolean = false;

  private onChange: (value: File[]) => void = () => {};
  private onTouched: () => void = () => {};

  get uploadClasses(): string {
    const classes = [
      'file-upload',
      `file-upload--${this.size}`,
      `file-upload--${this.variant}`,
      this.disabled ? 'file-upload--disabled' : '',
      this.isDragging ? 'file-upload--dragging' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(Array.from(input.files));
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  private processFiles(fileList: File[]): void {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileList) {
      if (file.size > this.maxFileSize) {
        errors.push(`Le fichier "${file.name}" dépasse la taille maximale autorisée (${this.formatFileSize(this.maxFileSize)})`);
        continue;
      }

      if (this.accept && !this.isFileTypeValid(file)) {
        errors.push(`Le type de fichier "${file.name}" n'est pas autorisé`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      this.fileError.emit(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      if (!this.multiple) {
        this.files = [validFiles[0]];
        this.previewUrls = [];
      } else {
        this.files = [...this.files, ...validFiles];
      }

      this.generatePreviews(validFiles);
      this.onChange(this.files);
      this.fileSelected.emit(this.files);
    }
  }

  private isFileTypeValid(file: File): boolean {
    if (this.accept === '*') return true;
    
    const acceptTypes = this.accept.split(',').map(type => type.trim());
    return acceptTypes.some(type => {
      if (type === 'image/*') {
        return file.type.startsWith('image/');
      }
      return file.type === type || file.name.toLowerCase().endsWith(type.replace('*.', '.'));
    });
  }

  private generatePreviews(files: File[]): void {
    if (!this.showPreview) return;

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrls.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
    this.previewUrls.splice(index, 1);
    this.onChange(this.files);
  }

  clearAll(): void {
    this.files = [];
    this.previewUrls = [];
    this.onChange(this.files);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ControlValueAccessor implementation
  writeValue(value: File[]): void {
    this.files = value || [];
  }

  registerOnChange(fn: (value: File[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
