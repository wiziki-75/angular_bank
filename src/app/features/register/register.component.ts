import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Pour rediriger après succès
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  authForm!: FormGroup;
  isLoginMode = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authForm = this.fb.group({
      identifier: ['', [Validators.required]], // Sera 'name' ou 'codeClient'
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.authForm.reset(); // On vide le formulaire lors du switch
  }

  onSubmit() {
    if (this.authForm.invalid) return;

    this.loading = true;
    const { identifier, password } = this.authForm.value;

    if (this.isLoginMode) {
      console.log('Tentative de connexion avec :', { clientCode: identifier }); // Log avant envoi

      this.authService.login({ clientCode: identifier, password }).subscribe({
        next: (response) => {
          console.log('✅ Connexion réussie ! Résultat de l\'API :', response);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('❌ Erreur de connexion :', err);
          this.loading = false;
        }
      });
    } else {
      console.log('Tentative d\'inscription avec :', { name: identifier });

      this.authService.register({ name: identifier, password }).subscribe({
        next: (response) => {
          console.log('✅ Inscription réussie ! Résultat de l\'API :', response);
          this.toggleMode();
        },
        error: (err) => {
          console.error('❌ Erreur d\'inscription :', err);
          this.loading = false;
        }
      });
    }
  }
}