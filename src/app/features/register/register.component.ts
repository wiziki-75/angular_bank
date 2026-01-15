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

  /* =========================
     KEYPAD
     ========================= */

  generateKeypad(): void {
    const digits: number[] = Array.from({ length: 10 }, (_, i) => i);
    const shuffled = digits.sort(() => Math.random() - 0.5);

    const keypad: (number | '')[] = [...shuffled];
    keypad.splice(4, 0, '');
    keypad.splice(9, 0, '');

    this.keypad = keypad;
    this.clearPassword();
  }

  onKeyPress(key: number | ''): void {
    if (key === '') return;
    if (this.enteredPassword.length >= 6) return;

    this.enteredPassword += key.toString();
    this.authForm.get('password')?.setValue(this.enteredPassword);
  }

  /* =========================
     CLEAR PASSWORD
     ========================= */

  clearPassword(): void {
    this.enteredPassword = '';
    this.authForm.get('password')?.setValue('');
  }

  /* =========================
     FORM
     ========================= */

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.authForm.reset();
    this.generateKeypad();
  }

  onSubmit(): void {
    if (this.authForm.invalid) return;

    const { identifier, password } = this.authForm.value;

    if (this.isLoginMode) {
      this.authService.login({ clientCode: identifier, password }).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: err => console.error('❌ Login error', err)
      });
    } else {
      this.authService.register({ name: identifier, password }).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: err => console.error('❌ Register error', err)
      });
    }
  }
}
