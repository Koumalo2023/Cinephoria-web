import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  setSeoData(customData?: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
  }) {
    const defaultSeo = environment.seo;
    const seoData = { ...defaultSeo, ...customData };

    // Titre de la page
    this.title.setTitle(seoData.title);

    // Meta tags
    this.meta.updateTag({ name: 'description', content: seoData.description });
    this.meta.updateTag({ name: 'keywords', content: seoData.keywords });
    
    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: seoData.title });
    this.meta.updateTag({ property: 'og:description', content: seoData.description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: seoData.url || `https://${environment.domain}` });
    
    if (seoData.image) {
      this.meta.updateTag({ property: 'og:image', content: seoData.image });
    }

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: seoData.title });
    this.meta.updateTag({ name: 'twitter:description', content: seoData.description });
  }

  // Méthode pour mettre à jour uniquement le titre
  setTitle(title: string) {
    this.title.setTitle(title);
  }

  // Méthode pour mettre à jour la description
  setDescription(description: string) {
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }
}