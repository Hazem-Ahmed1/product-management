import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
import type { PaginationMeta } from '../../../../../models/product.model';

@Component({
  selector: 'app-product-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-pagination.html',
  styleUrl: './product-pagination.css',
})
export class ProductPagination {
  readonly meta = input.required<PaginationMeta>();
  readonly pageChange = output<number>();

  readonly pages = computed(() => {
    const { current_page, last_page } = this.meta();
    const delta = 2;
    const pages: (number | '...')[] = [];
    const left = current_page - delta;
    const right = current_page + delta;

    for (let i = 1; i <= last_page; i++) {
      if (i === 1 || i === last_page || (i >= left && i <= right)) {
        pages.push(i);
      } else if ((i === left - 1 && left > 2) || (i === right + 1 && right < last_page - 1)) {
        pages.push('...');
      }
    }
    return pages;
  });

  goTo(page: number): void {
    const { current_page, last_page } = this.meta();
    if (page < 1 || page > last_page || page === current_page) return;
    this.pageChange.emit(page);
  }
}
