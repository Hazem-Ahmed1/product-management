import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, switchMap, of } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { Breadcrumb } from '../../../shared/components/breadcrumb/breadcrumb';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-admin-product-details',
  imports: [CurrencyPipe, DatePipe, Breadcrumb, LoadingSpinner, RouterLink],
  templateUrl: './admin-product-details.html',
  styleUrl: './admin-product-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProductDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly products = inject(ProductService);

  readonly productId$ = this.route.paramMap.pipe(map((params) => Number(params.get('id'))));

  private readonly productResult$ = this.productId$.pipe(
    switchMap((id) => {
      if (!id || isNaN(id)) {
        this.router.navigate(['/not-found'], {
          queryParams: { message: 'Product not found. You may go back to the dashboard.' },
          replaceUrl: true,
        });
        return of({ data: null, error: 'Invalid ID' });
      }
      return this.products.getOne(id).pipe(
        map((res) => ({ data: res.data, error: null })),
        catchError((err: Error) => {
          if (err.message === 'Product not found.') {
            this.router.navigate(['/not-found'], {
              queryParams: { message: 'Product not found. You may go back to the dashboard.' },
              replaceUrl: true,
            });
          }
          return of({ data: null, error: err.message });
        })
      );
    })
  );

  private readonly result = toSignal(this.productResult$, { initialValue: null });

  readonly product = computed(() => this.result()?.data ?? null);
  readonly loadState = computed(() => {
    const res = this.result();
    if (!res) return 'loading';
    if (res.error) return 'error';
    return 'success';
  });

  readonly breadcrumb = computed(() => {
    const p = this.product();
    return [
      { label: 'Products', route: ['/admin/products'] },
      { label: p ? p.name : 'Loading...' },
    ];
  });
}
