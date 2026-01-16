import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Intercepteur HTTP qui ajoute automatiquement le token d'authentification
 * à tous les appels API sortants.
 * Élimine la duplication de la logique getHeaders() dans chaque service.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');

  // Ne pas ajouter le header si pas de token (ex: register/login)
  if (!token) {
    return next(req);
  }

  // Cloner la requête et ajouter le header Authorization
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
