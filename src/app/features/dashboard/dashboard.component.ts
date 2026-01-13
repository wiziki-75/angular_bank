import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="user">
      <h1>Bienvenue, {{ user.name }} !</h1>
      <p>Votre code client : {{ user.clientCode }}</p>
      <button (click)="logout()">Déconnexion</button>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  user: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (userData) => {
        this.user = userData;
        console.log('Données utilisateur chargées :', userData);
      },
      error: (err) => {
        console.error('Accès refusé, redirection...', err);
        this.router.navigate(['/register']);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/register']);
  }
}