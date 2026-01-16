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

  /*keypad*/

  generateKeypad(): void {
  const digits: number[] = Array.from({ length: 10 }, (_, i) => i);


  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }

  const keypad: (number | '')[] = [...digits];

  const positions = this.pickTwoEmptyPositions(12);

// 2 vides
  const [p1, p2] = positions.sort((a, b) => a - b);
  keypad.splice(p1, 0, '');
  keypad.splice(p2, 0, '');

  this.keypad = keypad;
  this.clearPassword();
}

private pickTwoEmptyPositions(totalKeys: number): [number, number] {
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

  /*clear*/

  clearPassword(): void {
    this.enteredPassword = '';
    this.authForm.get('password')?.setValue('');
  }

  /*form*/

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
