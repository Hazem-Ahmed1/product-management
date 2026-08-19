import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-product-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-status-badge.html',
  styleUrl: './product-status-badge.css',
})
export class ProductStatusBadge {
  readonly active = input.required<boolean>();
}
