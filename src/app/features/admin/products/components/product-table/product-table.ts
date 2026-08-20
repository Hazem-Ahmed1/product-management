import { ChangeDetectionStrategy, Component, input, computed, signal, output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Product } from '../../../../../models/product.model';
import type { LoadState } from '../../products';
import { ProductStatusBadge } from '../product-status-badge/product-status-badge';

@Component({
  selector: 'app-product-table',
  imports: [RouterLink, ProductStatusBadge, CurrencyPipe, DatePipe],
  templateUrl: './product-table.html',
  styleUrl: './product-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductTable {
  readonly products = input.required<Product[]>();
  readonly loadState = input.required<LoadState>();
  readonly perPage = input(15);

  readonly deleteProduct = output<Product>();

  private readonly failedImageIds = signal<ReadonlySet<number>>(new Set());

  /** Array of skeleton row indices for the loading state */
  readonly skeletonRows = computed(() => Array.from({ length: this.perPage() }));

  imageFailed(productId: number): void {
    this.failedImageIds.update((ids) => new Set(ids).add(productId));
  }

  hasUsableImage(product: Product): boolean {
    return !!product.thumbnail_url && !this.failedImageIds().has(product.id);
  }

  onDelete(product: Product): void {
    this.deleteProduct.emit(product);
  }
}
