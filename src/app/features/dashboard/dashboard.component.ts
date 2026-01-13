import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

interface Transaction {
  id: number;
  label: string;
  amount: number;
  date: Date;
  type: 'credit' | 'debit';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userName: string = 'Utilisateur';
  balance: number = 2450.75;
  transactions: Transaction[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Simulation de récupération de données
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Ici vous appellerez plus tard votre AccountService
    this.transactions = [
      { id: 1, label: 'Salaire Janvier', amount: 3200, date: new Date(), type: 'credit' },
      { id: 2, label: 'Loyer', amount: -850, date: new Date(), type: 'debit' },
      { id: 3, label: 'Supermarché', amount: -120.50, date: new Date(), type: 'debit' }
    ];
  }
}