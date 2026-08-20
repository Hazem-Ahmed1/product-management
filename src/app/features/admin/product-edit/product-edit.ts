import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  effect,
  computed,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, Subject } from 'rxjs';
import { catchError, exhaustMap, finalize, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProductService } from '../../../services/product.service';
import { CURRENCIES, ProductValidationError } from '../../../models/product.model';
import { Breadcrumb } from '../../../shared/components/breadcrumb/breadcrumb';
import { CustomSelect } from '../../../shared/components/custom-select/custom-select';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ProductLivePreview } from '../product-create/components/product-live-preview/product-live-preview';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { HasUnsavedChanges } from '../../../core/guards/unsaved-changes.guard';

@Component({
  selector: 'app-product-edit',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Breadcrumb,
    CustomSelect,
    ProductLivePreview,
    ConfirmModal,
  ],
  templateUrl: './product-edit.html',
  styleUrl: './product-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEdit implements HasUnsavedChanges {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  private readonly routeParams = toSignal(this.route.paramMap);
  private readonly productId = computed(() => Number(this.routeParams()?.get('id')));

  readonly currencies = CURRENCIES;
  readonly isLoading = signal(false);
  readonly isFetching = signal(true);
  readonly serverError = signal('');
  
  readonly isConfirmModalOpen = signal(false);
  readonly isLeaveModalOpen = signal(false);
  private leaveResolver: ((value: boolean) => void) | null = null;
  private readonly formInitialized = signal(false);

  readonly breadcrumb = computed(() => [
    { label: 'Products', route: ['/admin/products'] },
    { label: 'Edit Product' },
  ]);

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

  /** Reactive preview for the UI */
  readonly preview = toSignal(
    this.form.valueChanges,
    { initialValue: this.form.getRawValue() }
  );

  private readonly submit$ = new Subject<void>();

  constructor() {
    effect(() => {
      const id = this.productId();
      if (id && !this.formInitialized()) {
        this.isFetching.set(true);
        this.productService.getOne(id).subscribe({
          next: (res) => {
            const p = res.data;
            this.form.patchValue({
              name: p.name,
              description: p.description || '',
              price: p.price,
              currency: p.currency,
              stock: p.stock,
              is_active: p.is_active,
            });
            this.form.markAsPristine();
            this.formInitialized.set(true);
            this.isFetching.set(false);
          },
          error: () => {
            this.toast.error('Failed to load product.');
            this.router.navigate(['/admin/products']);
          }
        });
      }
    });

    this.submit$
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.serverError.set('');
        }),
        exhaustMap(() =>
          this.productService
            .update(this.productId(), {
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
                  Object.entries(err.fieldErrors).forEach(([field, messages]) => {
                    this.form.get(field)?.setErrors({ serverError: messages[0] });
                  });
                }
                this.serverError.set(err.message);
                return EMPTY;
              }),
              finalize(() => {
                this.isLoading.set(false);
                this.isConfirmModalOpen.set(false);
              }),
            ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.form.markAsPristine();
        this.toast.success('Product updated successfully!');
        this.router.navigate(['/admin/products']);
      });
  }

  // ── Unsaved Changes Guard ───────────────────────────────────────
  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  confirmNavigation(): Promise<boolean> {
    this.isLeaveModalOpen.set(true);
    return new Promise((resolve) => {
      this.leaveResolver = resolve;
    });
  }

  confirmLeave(): void {
    this.isLeaveModalOpen.set(false);
    if (this.leaveResolver) {
      this.leaveResolver(true);
      this.leaveResolver = null;
    }
  }

  cancelLeave(): void {
    this.isLeaveModalOpen.set(false);
    if (this.leaveResolver) {
      this.leaveResolver(false);
      this.leaveResolver = null;
    }
  }

  // ── Submit flow ──────────────────────────────────────────────────
  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isConfirmModalOpen.set(true);
  }

  confirmSave(): void {
    this.submit$.next();
  }

  cancelSave(): void {
    this.isConfirmModalOpen.set(false);
  }

  setCurrency(val: string): void {
    this.form.controls.currency.setValue(val);
    this.form.controls.currency.markAsTouched();
    this.form.markAsDirty();
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
