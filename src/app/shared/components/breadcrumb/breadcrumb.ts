import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  /** If omitted the item renders as plain text (current page) */
  route?: string | string[];
}

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="bc" aria-label="Breadcrumb">
      <ol class="bc__list" role="list">
        @for (item of items(); track item.label; let last = $last) {
          <li class="bc__item">
            @if (!last && item.route) {
              <a [routerLink]="item.route" class="bc__link">{{ item.label }}</a>
              <i class="fa-solid fa-chevron-right bc__sep" aria-hidden="true"></i>
            } @else {
              <span class="bc__current" aria-current="page">{{ item.label }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    :host { display: block; margin-bottom: 1rem; }
    .bc__list {
      list-style: none;
      margin: 0; padding: 0;
      display: flex; align-items: center; flex-wrap: wrap; gap: 0.25rem;
    }
    .bc__item { display: flex; align-items: center; gap: 0.25rem; }
    .bc__link {
      font-size: 0.8rem; font-weight: 500;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.15s;
    }
    .bc__link:hover { color: var(--primary); }
    .bc__link:focus-visible { outline: 2px solid var(--primary); border-radius: 3px; }
    .bc__sep { font-size: 0.55rem; color: var(--text-muted); opacity: 0.5; }
    .bc__current {
      font-size: 0.8rem; font-weight: 600;
      color: var(--text-main);
    }
  `],
})
export class Breadcrumb {
  readonly items = input.required<BreadcrumbItem[]>();
}
