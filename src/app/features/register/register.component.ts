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
  errorMessage = '';
  isLoading = false;

  keypad: (number | '')[] = [];
  enteredPassword = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authForm = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', [Validators.required, Validators.maxLength(6)]]
    });

    this.generateKeypad();
  }

  generateKeypad(): void {
  const digits: number[] = Array.from({ length: 10 }, (_, i) => i);

  // ✅ Shuffle (Fisher-Yates) : mieux que sort(Math.random()-0.5)
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }

  // Base keypad = 10 chiffres
  const keypad: (number | '')[] = [...digits];

  // ✅ Choisir 2 positions distinctes parmi 0..12 (car on va avoir 12 touches au final)
  const positions = this.pickTwoEmptyPositions(12);

  // ✅ Insérer les 2 trous (on insère dans l'ordre croissant pour ne pas décaler la seconde insertion)
  const [p1, p2] = positions.sort((a, b) => a - b);
  keypad.splice(p1, 0, '');
  keypad.splice(p2, 0, '');

  this.keypad = keypad;
  this.clearPassword();
}

private pickTwoEmptyPositions(totalKeys: number): [number, number] {
  // totalKeys = 12 (10 chiffres + 2 trous)
  const first = Math.floor(Math.random() * totalKeys);
  let second = Math.floor(Math.random() * totalKeys);
  while (second === first) {
    second = Math.floor(Math.random() * totalKeys);
  }
  return [first, second];
}


  onKeyPress(key: number | ''): void {
    if (key === '') return;
    if (this.enteredPassword.length >= 6) return;

    this.enteredPassword += key.toString();
    this.authForm.get('password')?.setValue(this.enteredPassword);
  }

  clearPassword(): void {
    this.enteredPassword = '';
    this.authForm.get('password')?.setValue('');
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.authForm.reset();
    this.generateKeypad();
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }

    const { identifier, password } = this.authForm.value;
    this.errorMessage = '';
    this.isLoading = true;

    if (this.isLoginMode) {
      this.authService.login({ clientCode: identifier, password }).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Identifiant ou mot de passe incorrect';
        }
      });
    } else {
      this.authService.register({ name: identifier, password }).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Erreur lors de la création du compte';
        }
      });
    }
  }
}
