import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { StatusFilter, PageSize } from '../../../../../models/product.model';
import { PAGE_SIZE_OPTIONS } from '../../../../../models/product.model';
import { CustomSelect } from '../../../../../shared/components/custom-select/custom-select';

@Component({
  selector: 'app-product-toolbar',
  imports: [CustomSelect],
  templateUrl: './product-toolbar.html',
  styleUrl: './product-toolbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductToolbar {
  readonly search = input('');
  readonly statusFilter = input<StatusFilter>('all');
  readonly perPage = input<PageSize>(15);

  readonly searchChange = output<string>();
  readonly statusChange = output<StatusFilter>();
  readonly perPageChange = output<PageSize>();

  readonly pageSizeOptions = PAGE_SIZE_OPTIONS.map((size) => ({
    value: size,
    label: `${size} / page`,
  }));
  readonly statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  clearSearch(): void {
    this.searchChange.emit('');
  }

  onStatusSelect(value: StatusFilter): void {
    this.statusChange.emit(value);
  }
  onPerPageSelect(value: PageSize): void {
    this.perPageChange.emit(value);
  }
}
