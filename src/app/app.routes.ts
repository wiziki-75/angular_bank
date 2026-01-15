import { Routes } from '@angular/router';
import { RegisterComponent } from './features/register/register.component';
import { TransactionComponent } from './features/transaction/transaction.component';
import { InfoComponent } from './features/info/info.component';
import { OpenAccountComponent } from './features/open-account/open-account.component';

export const routes: Routes = [
  // Redirection racine
  { path: '', redirectTo: 'register', pathMatch: 'full' },

  // Auth
  { path: 'register', component: RegisterComponent },

  // Dashboard (lazy)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },

  // Virement
  { path: 'transaction', component: TransactionComponent },

  // 🔥 DÉTAIL TRANSACTION (manquant)
  {
    path: 'transaction-detail',
    loadComponent: () =>
      import('./features/transaction-detail/transaction-detail.component')
        .then(m => m.TransactionDetailComponent)
  },

  // Info compte
  { path: 'info', component: InfoComponent },

  //Ouverture compte
  { path: 'open-account', component: OpenAccountComponent },

  // Fallback sécurité
  { path: '**', redirectTo: 'register' }
];
