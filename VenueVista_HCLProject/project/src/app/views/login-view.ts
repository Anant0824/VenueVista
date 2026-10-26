import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Icon } from '../components/icon';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login-view',
  imports: [FormsModule, Icon],
  templateUrl: './login-view.html',
})
export class LoginView {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  mode = signal<'login' | 'signup'>('login');
  username = '';
  password = '';
  email = '';
  loading = signal(false);
  error = signal<string | null>(null);

  setMode(mode: 'login' | 'signup'): void {
    this.mode.set(mode);
    this.error.set(null);
  }

  submit(e: Event): void {
    e.preventDefault();
    this.error.set(null);
    this.loading.set(true);

    const request = this.mode() === 'login'
      ? this.authService.login({ username: this.username, password: this.password })
      : this.authService.signup({ username: this.username, password: this.password, email: this.email });

    request.subscribe({
      next: (response) => {
        this.loading.set(false);
        this.router.navigateByUrl(
          response.role === 'ROLE_CREATOR' || response.role === 'ROLE_ADMIN' ? '/control-room' : '/',
        );
      },
      error: (err) => {
        this.loading.set(false);
        console.error(this.mode() === 'login' ? 'Login failed' : 'Signup failed', err);
        this.error.set(this.mode() === 'login'
          ? 'Invalid username or password'
          : err.error?.message || 'Unable to create account. Check your details and try again.');
      }
    });
  }

  back(): void {
    this.router.navigateByUrl('/');
  }
}
