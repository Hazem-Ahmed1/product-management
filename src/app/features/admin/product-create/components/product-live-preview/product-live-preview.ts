import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-live-preview',
  imports: [CurrencyPipe],
  templateUrl: './product-live-preview.html',
  styleUrl: './product-live-preview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductLivePreview {
  readonly product = input.required<{
    name?: string | null;
    description?: string | null;
    price?: number | null;
    currency?: string | null;
    stock?: number | null;
  }>();

  readonly stockLevel = computed<'out' | 'low' | 'available'>(() => {
    const s = Number(this.product().stock ?? 0);
    if (s === 0)   return 'out';
    if (s <= 10)   return 'low';
    return 'available';
  });
}
