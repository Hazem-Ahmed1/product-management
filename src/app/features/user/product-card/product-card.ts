import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Product } from '../../../models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly availability = computed(() => {
    const stock = this.product().stock;
    if (stock === 0) return { label: 'Out of stock',    level: 'out'       };
    if (stock <= 5)  return { label: `${stock} in stock`, level: 'critical' };
    if (stock <= 10) return { label: `${stock} in stock`, level: 'low'      };
    return             { label: `${stock} in stock`, level: 'available' };
  });


}
