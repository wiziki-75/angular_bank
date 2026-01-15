import { Routes } from '@angular/router';
import { RegisterComponent } from './features/register/register.component';
import { TransactionComponent } from './features/transaction/transaction.component';
import { InfoComponent } from './features/info/info.component';

export const routes: Routes = [
  // On redirige la racine vers register
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  // On charge directement le composant
  { path: 'register', component: RegisterComponent },
  // Exemple pour le futur dashboard
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { path: 'transaction', component: TransactionComponent },
  { path: 'info', component: InfoComponent }
];