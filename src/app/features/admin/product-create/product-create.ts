import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, Subject } from 'rxjs';
import {
  catchError,
  exhaustMap,
  finalize,
  startWith,
  tap,
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../services/product.service';
import {
  CURRENCIES,
  ProductValidationError,
} from '../../../models/product.model';
import { Breadcrumb } from '../../../shared/components/breadcrumb/breadcrumb';
import { CustomSelect } from '../../../shared/components/custom-select/custom-select';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ProductLivePreview } from './components/product-live-preview/product-live-preview';

@Component({
  selector: 'app-product-create',
  imports: [ReactiveFormsModule, RouterLink, Breadcrumb, CustomSelect, ProductLivePreview],
  templateUrl: './product-create.html',
  styleUrl: './product-create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreate {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly currencies = CURRENCIES;
  readonly isLoading = signal(false);
  readonly serverError = signal('');

  readonly breadcrumb = [
    { label: 'Products', route: ['/admin/products'] },
    { label: 'Create Product' },
  ];

  readonly currencyOptions = this.currencies.map(c => ({
    value: c.code,
    label: c.label,
  }));

  readonly form = this.fb.group({
    name:        ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    price:       [10, [Validators.required, Validators.min(5)]],
    currency:    ['USD', [Validators.required]],
    stock:       [10, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    is_active:   [true],
  });

  /** Reactive preview — updates on every keystroke without triggering CD manually */
  readonly preview = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  // ── Submit pipeline ─────────────────────────────────────────────
  private readonly submit$ = new Subject<void>();

  constructor() {
    this.submit$
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.serverError.set('');
        }),
        exhaustMap(() =>
          this.productService
            .create({
              name:        this.form.getRawValue().name,
              description: this.form.getRawValue().description || undefined,
              stock:       Number(this.form.getRawValue().stock),
              price:       Number(this.form.getRawValue().price),
              currency:    this.form.getRawValue().currency,
              is_active:   this.form.getRawValue().is_active,
            })
            .pipe(
              catchError((err: Error) => {
                if (err instanceof ProductValidationError) {
                  // Apply field-level errors from backend onto form controls
                  Object.entries(err.fieldErrors).forEach(([field, messages]) => {
                    this.form.get(field)?.setErrors({ serverError: messages[0] });
                  });
                }
                this.serverError.set(err.message);
                return EMPTY;
              }),
              finalize(() => this.isLoading.set(false)),
            ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.toast.success('Product created successfully!');
        this.router.navigate(['/admin/products']);
      });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submit$.next();
  }

  setCurrency(val: string): void {
    this.form.controls.currency.setValue(val);
    this.form.controls.currency.markAsTouched();
  }

  // ── Helpers ──────────────────────────────────────────────────────
  isInvalid(control: string): boolean {
    const c = this.form.get(control);
    return !!(c?.invalid && c.touched);
  }

  errorFor(control: string): string {
    const c = this.form.get(control);
    if (!c?.errors) return '';
    if (c.errors['required'])    return 'This field is required.';
    if (c.errors['maxlength'])   return `Max ${c.errors['maxlength'].requiredLength} characters.`;
    if (c.errors['min'])         return `Minimum value is ${c.errors['min'].min}.`;
    if (c.errors['pattern'])     return 'Must be a whole number.';
    if (c.errors['serverError']) return c.errors['serverError'] as string;
    return 'Invalid value.';
  }
}
