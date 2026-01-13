import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

  keypad: (number | null)[] = [];
  readonly MAX_PASSWORD_LENGTH = 6;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ESSENTIEL : Initialiser le formulaire ici pour débloquer les boutons
    this.authForm = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(this.MAX_PASSWORD_LENGTH)
      ]]
    });

    this.generateKeypad();
  }

  /* =========================
     PAVÉ NUMÉRIQUE
     ========================= */

  generateKeypad(): void {
    const numbers = Array.from({ length: 10 }, (_, i) => i);
    const emptyKeys = [null, null];
    const keys = [...numbers, ...emptyKeys];

    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }

    this.keypad = keys;
  }

  onKeyPress(key: number | null): void {
    if (key === null) return;

    const control = this.authForm.get('password');
    const currentValue: string = control?.value || '';

    // 🔒 Limite à 6 chiffres
    if (currentValue.length >= this.MAX_PASSWORD_LENGTH) return;

    control?.setValue(currentValue + key);
  }

  /* =========================
     MODE LOGIN / REGISTER
     ========================= */

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.authForm.reset();
    this.generateKeypad();
  }

  /* =========================
     IDENTIFIANT CLIENT
     ========================= */

  private generateClientIdentifier(): string {
    // Identifiant client simple : 8 chiffres
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  /* =========================
     SUBMIT
     ========================= */

  onSubmit(): void {
    if (this.authForm.invalid) return;
    this.loading = true;

    const { identifier, password } = this.authForm.value;

    if (this.isLoginMode) {

      this.authService.login({ clientCode: identifier, password }).subscribe({
        next: () => {
          this.generateKeypad();
          this.router.navigate(['/dashboard']);
        },
        error: () => this.loading = false
      });

    } else {
      // 🆕 Création identifiant client
      const clientIdentifier = this.generateClientIdentifier();

      console.log('🆔 Identifiant client créé :', clientIdentifier);

      this.authService.register({
        name: identifier,
        clientCode: clientIdentifier,
        password
      }).subscribe({
        next: () => {
          // 🔁 Redirection directe vers le compte client
          this.router.navigate(['/dashboard']);
        },
        error: () => this.loading = false
      });
    }
  }
}
