import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { exhaustMap, tap, catchError, finalize, EMPTY } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // UI state
  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  /** True when user had a session this tab but refreshed the page */
  readonly sessionExpired = this.authService.sessionExpired;

  // Form
  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // Performance: submit$ stream processes login without re-subscribing
  private readonly submit$ = new Subject<void>();

  constructor() {
    this.submit$
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.errorMessage.set('');
        }),
        exhaustMap(() =>
          this.authService
            .login({
              email: this.loginForm.getRawValue().email,
              password: this.loginForm.getRawValue().password,
            })
            .pipe(
              catchError((err: Error) => {
                this.errorMessage.set(err.message);
                return EMPTY;
              }),
              finalize(() => this.isLoading.set(false)),
            ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.router.navigate(['/admin/products']);
      });
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.submit$.next();
  }

  get emailControl() {
    return this.loginForm.controls.email;
  }

  get passwordControl() {
    return this.loginForm.controls.password;
  }
}
