import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import type {
  PaginatedResponse,
  Product,
  StatusFilter,
  PageSize,
} from '../../../models/product.model';
import { ProductToolbar } from './components/product-toolbar/product-toolbar';
import { ProductTable } from './components/product-table/product-table';
import { ProductPagination } from './components/product-pagination/product-pagination';
import { Breadcrumb } from '../../../shared/components/breadcrumb/breadcrumb';

export type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-products',
  imports: [RouterLink, ProductToolbar, ProductTable, ProductPagination, Breadcrumb],
  templateUrl: './products.html',
  styleUrl: './products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  private readonly productService = inject(ProductService);

  readonly page         = signal(1);
  readonly perPage      = signal<PageSize>(15);
  readonly search       = signal('');
  readonly statusFilter = signal<StatusFilter>('all');

  private readonly debouncedSearch = toSignal(
    toObservable(this.search).pipe(
      debounceTime(350),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  private readonly params = computed(() => ({
    page:      this.page(),
    per_page:  this.perPage(),
    search:    this.debouncedSearch() || undefined,
    is_active:
      this.statusFilter() === 'active'   ? true  :
      this.statusFilter() === 'inactive' ? false  :
      undefined,
  }));

  private readonly productsResource = rxResource<PaginatedResponse<Product>, ReturnType<typeof this.params>>({
    params: () => this.params(),
    stream:  ({ params }) => this.productService.getAll(params),
  });

  readonly products  = computed(() => this.productsResource.value()?.data  ?? []);
  readonly meta      = computed(() => this.productsResource.value()?.meta  ?? null);

  readonly loadState = computed<LoadState>(() =>
    this.productsResource.isLoading() ? 'loading' :
    this.productsResource.error()     ? 'error'   :
    'success',
  );

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

  onSearchChange(term: string): void {
    this.search.set(term);
    this.page.set(1);
  }

  onStatusChange(status: StatusFilter): void {
    this.statusFilter.set(status);
    this.page.set(1);
  }

  onPerPageChange(size: PageSize): void {
    this.perPage.set(size);
    this.page.set(1);
  }

  onPageChange(p: number): void {
    this.page.set(p);
  }

  retry(): void {
    this.productsResource.reload();
  }
}
