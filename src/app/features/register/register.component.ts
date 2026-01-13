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
    // ESSENTIEL : Initialiser le formulaire ici pour débloquer les boutons
    this.authForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.authForm.reset();
    this.loading = false;
  }

  onSubmit() {
    if (this.authForm.invalid) return;
    this.loading = true;

    const { identifier, password } = this.authForm.value;

    if (this.isLoginMode) {
      // On utilise le nom de propriété attendu par votre API (clientCode ou codeClient)
      this.authService.login({ clientCode: identifier, password }).subscribe({
        next: (response) => {
          console.log('✅ Login API Response:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('❌ Login Error:', err);
          this.loading = false;
        }
      });
    } else {
      this.authService.register({ name: identifier, password }).subscribe({
        next: (response) => {
          console.log('✅ Register API Response:', response);
          this.loading = false;
          this.toggleMode(); // Bascule vers connexion après inscription
        },
        error: (err) => {
          console.error('❌ Register Error:', err);
          this.loading = false;
        }
      });
    }
  }
}