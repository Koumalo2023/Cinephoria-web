import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { CorsFallbackInterceptor } from './cors-fallback.interceptor';
import { ErrorInterceptor } from './error.interceptor';
import { ProfileErrorInterceptor } from './profile-error.interceptor';

/**
 * Fournisseurs d'intercepteurs HTTP pour l'application
 * Ces intercepteurs sont appliqués dans l'ordre spécifié
 */
export const httpInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ProfileErrorInterceptor,
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: CorsFallbackInterceptor,
    multi: true
  }
];