import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

// Import des classes abstraites (les contrats)
import { AuthService } from './core/auth.service';
import { AccountService } from './core/account.service';
import { TransactionService } from './core/transaction.service';

// Import des implémentations réelles (HTTP)
import { AuthHttpService } from './core/auth-http.service';
import { AccountHttpService } from './core/account-http.service';
import { TransactionHttpService } from './core/transaction-http.service';

// Import des implémentations de démo (In-Memory)
import { AuthInMemoryService } from './core/auth-in-memory.service';
import { AccountInMemoryService } from './core/account-in-memory.service';
import { TransactionInMemoryService } from './core/transaction-in-memory.service';

// Change cette variable à 'false' pour repasser sur le serveur réel
const IS_DEMO = true;

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    // Injection du service d'authentification
    {
      provide: AuthService,
      useClass: IS_DEMO ? AuthInMemoryService : AuthHttpService
    },

    // Injection du service de gestion des comptes
    {
      provide: AccountService,
      useClass: IS_DEMO ? AccountInMemoryService : AccountHttpService
    },

    // Injection du service de transactions
    {
      provide: TransactionService,
      useClass: IS_DEMO ? TransactionInMemoryService : TransactionHttpService
    }
  ]
};