import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<string>();
  
  searchQuery: string = '';

  onSearch(): void {
    this.search.emit(this.searchQuery);
  }

  onClear(): void {
    this.searchQuery = '';
    this.search.emit('');
  }
}
