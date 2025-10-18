import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  badge?: number | string;
  disabled?: boolean;
  hidden?: boolean;
}

@Component({
  selector: 'app-tab-container',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    BadgeComponent
  ],
  templateUrl: './tab-container.component.html',
  styleUrls: ['./tab-container.component.scss']
})
export class TabContainerComponent implements OnChanges {
  @Input() tabs: TabConfig[] = [];
  @Input() activeTabId: string = '';
  @Input() tabType: 'standard' | 'pills' | 'underline' | 'cards' = 'standard';
  @Input() tabPosition: 'top' | 'left' | 'right' = 'top';
  @Input() tabSize: 'sm' | 'md' | 'lg' = 'md';
  @Input() fullWidth: boolean = false;
  @Input() lazyLoad: boolean = false;
  @Input() preserveState: boolean = false;
  @Input() scrollable: boolean = false;
  @Input() maxWidth: string = '100%';
  
  @Output() tabChange = new EventEmitter<string>();
  @Output() tabClose = new EventEmitter<string>();
  
  private tabStates: Map<string, any> = new Map();
  private loadedTabs: Set<string> = new Set();
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['tabs'] && this.tabs.length > 0 && !this.activeTabId) {
      const firstEnabledTab = this.tabs.find(tab => !tab.disabled && !tab.hidden);
      if (firstEnabledTab) {
        this.activeTabId = firstEnabledTab.id;
      }
    }
  }
  
  selectTab(tabId: string): void {
    if (this.activeTabId === tabId) return;
    
    const tab = this.getTabById(tabId);
    if (!tab || tab.disabled) return;
    
    // Sauvegarder l'état actuel si nécessaire
    if (this.preserveState && this.activeTabId) {
      this.saveTabState(this.activeTabId);
    }
    
    // Charger l'état si nécessaire
    if (this.preserveState && this.tabStates.has(tabId)) {
      this.loadTabState(tabId);
    }
    
    // Marquer comme chargé pour le lazy loading
    if (this.lazyLoad) {
      this.loadedTabs.add(tabId);
    }
    
    this.activeTabId = tabId;
    this.tabChange.emit(tabId);
  }
  
  closeTab(tabId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    this.tabClose.emit(tabId);
    
    // Nettoyer l'état si nécessaire
    if (this.preserveState) {
      this.tabStates.delete(tabId);
    }
    
    if (this.lazyLoad) {
      this.loadedTabs.delete(tabId);
    }
    
    // Si on ferme l'onglet actif, sélectionner un autre onglet
    if (this.activeTabId === tabId) {
      const remainingTabs = this.getVisibleTabs();
      const currentIndex = remainingTabs.findIndex(tab => tab.id === tabId);
      let newActiveTab: TabConfig | undefined;
      
      if (currentIndex > 0) {
        newActiveTab = remainingTabs[currentIndex - 1];
      } else if (remainingTabs.length > 1) {
        newActiveTab = remainingTabs[currentIndex + 1];
      }
      
      if (newActiveTab) {
        this.selectTab(newActiveTab.id);
      } else {
        this.activeTabId = '';
      }
    }
  }
  
  getTabById(tabId: string): TabConfig | undefined {
    return this.tabs.find(tab => tab.id === tabId);
  }
  
  getVisibleTabs(): TabConfig[] {
    return this.tabs.filter(tab => !tab.hidden);
  }
  
  isTabActive(tabId: string): boolean {
    return this.activeTabId === tabId;
  }
  
  isTabLoaded(tabId: string): boolean {
    return !this.lazyLoad || this.loadedTabs.has(tabId);
  }
  
  private saveTabState(tabId: string): void {
    // Implémentation pour sauvegarder l'état de l'onglet
    // Peut être étendu selon les besoins spécifiques
    const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tabElement) {
      this.tabStates.set(tabId, {
        scrollPosition: tabElement.scrollTop,
        // Ajouter d'autres états si nécessaire
      });
    }
  }
  
  private loadTabState(tabId: string): void {
    const state = this.tabStates.get(tabId);
    if (state) {
      const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
      if (tabElement && state.scrollPosition) {
        tabElement.scrollTop = state.scrollPosition;
      }
    }
  }
  
  // Méthodes utilitaires pour les classes CSS
  getContainerClasses(): string[] {
    const classes = ['tab-container'];
    
    classes.push(`tab-type-${this.tabType}`);
    classes.push(`tab-position-${this.tabPosition}`);
    classes.push(`tab-size-${this.tabSize}`);
    
    if (this.fullWidth) {
      classes.push('full-width');
    }
    
    if (this.scrollable) {
      classes.push('scrollable');
    }
    
    return classes;
  }
  
  getTabClasses(tab: TabConfig): string[] {
    const classes = ['tab-item'];
    
    if (this.isTabActive(tab.id)) {
      classes.push('active');
    }
    
    if (tab.disabled) {
      classes.push('disabled');
    }
    
    return classes;
  }
  
  // Méthodes pour le contenu
  shouldShowContent(): boolean {
    return this.tabs && this.tabs.length > 0;
  }
}
