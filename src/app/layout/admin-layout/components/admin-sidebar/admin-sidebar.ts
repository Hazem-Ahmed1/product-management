import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  /** When true, only mark active on exact URL match */
  exact?: boolean;
}

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebar {
  readonly collapsed = input(false);
  readonly open = input(false);
  readonly navigationSelected = output<void>();

  readonly navItems: NavItem[] = [
    { label: 'Products',       icon: 'fa-box-open',    route: '/admin/products',        exact: true },
    { label: 'Create Product', icon: 'fa-circle-plus', route: '/admin/products/create', exact: true },
  ];
}
