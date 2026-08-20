import { ChangeDetectionStrategy, Component, inject, computed, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, CurrencyPipe, LoadingSpinner],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetails {
  private readonly route    = inject(ActivatedRoute);
  private readonly router   = inject(Router);
  private readonly products = inject(ProductService);

  private readonly paramMap = toSignal(this.route.paramMap);
  private readonly routeId = computed(() => Number(this.paramMap()?.get('id')));

  readonly productResource = rxResource({
    params: () => this.routeId(),
    stream: ({ params: id }) => {
      if (!id || isNaN(id)) {
        throw new Error('Product not found.');
      }
      return this.products.getOne(id).pipe(map(res => res.data));
    },
  });

  constructor() {
    effect(() => {
      const err = this.productResource.error() as any;
      if (err?.message === 'Product not found.') {
        this.router.navigate(['/not-found'], {
          queryParams: { message: 'Product not found. You may go to the home page.' },
          replaceUrl: true,
        });
      }
    });
  }

  readonly loadState = computed<'loading' | 'error' | 'success'>(() => {
    const status = this.productResource.status();
    if (status === 'error') return 'error';
    if (status === 'loading' || status === 'reloading') return 'loading';
    return 'success';
  });

  readonly product = computed(() => this.productResource.hasValue() ? this.productResource.value() : undefined);
  
  readonly errorMessage = computed(() => {
    const err = this.productResource.error();
    if (!err) return '';
    if (typeof err === 'object' && 'message' in err) return String((err as any).message);
    if (typeof err === 'string') return err;
    return 'Product could not be found.';
  });
}
