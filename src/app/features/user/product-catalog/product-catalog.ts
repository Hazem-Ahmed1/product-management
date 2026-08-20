import { ChangeDetectionStrategy, Component, inject, computed, signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import type { PageSize } from '../../../models/product.model';
import { ProductPagination } from '../../admin/products/components/product-pagination/product-pagination';
import { ProductCard } from '../product-card/product-card';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-product-catalog',
  imports: [ProductCard, ProductPagination, LoadingSpinner],
  templateUrl: './product-catalog.html',
  styleUrl: './product-catalog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCatalog {
  private readonly products = inject(ProductService);
  readonly search = signal('');
  readonly page = signal(1);
  readonly perPage = signal<PageSize>(15);
  private readonly debouncedSearch = toSignal(
    toObservable(this.search).pipe(debounceTime(350), distinctUntilChanged()),
    { initialValue: '' },
  );

  private readonly params = computed(() => ({
    page: this.page(),
    per_page: this.perPage(),
    search: this.debouncedSearch() || undefined,
    is_active: true,
  }));

  private readonly productsResource = rxResource({
    params: () => this.params(),
    stream: ({ params }) => this.products.getAll(params),
  });

  readonly productsList = computed(() => this.productsResource.hasValue() ? this.productsResource.value()?.data ?? [] : []);
  readonly meta = computed(() => this.productsResource.hasValue() ? this.productsResource.value()?.meta ?? null : null);

  readonly loadState = computed<LoadState>(() => {
    const status = this.productsResource.status();
    if (status === 'error') return 'error';
    if (status === 'loading' || status === 'reloading') return 'loading';
    return 'success';
  });

  readonly errorMessage = computed(() => {
    const err = this.productsResource.error();
    if (!err) return '';
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    if (typeof err === 'object' && 'message' in err) {
      return String((err as any).message) || 'An unexpected error occurred.';
    }
    return 'An unexpected error occurred.';
  });

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.page.set(1);
  }
  clearSearch(): void {
    this.search.set('');
    this.page.set(1);
  }
  onPageChange(page: number): void {
    this.page.set(page);
  }
  retry(): void {
    this.productsResource.reload();
  }
}
