// Services Core - Gestion d'état et utilitaires
export { CacheService } from './cache.service';
export { ErrorHandlerService } from './error-handler.service';
export { LoadingService } from './loading.service';
export { ModalService } from './modal.service';
export { NotificationService } from './notification.service';
export { RoleService } from './role.service';
export { StorageService } from './storage.service';

// Services API - Communication avec le backend
export * from './api';

// Services Auth - Gestion d'authentification
export { AuthManagerService } from './auth/auth-manager.service';

// Services Mapping - Transformation données API ↔ UI
export * from './mapping';

// Services Utilitaires
export { EnumService } from './enum.service';

