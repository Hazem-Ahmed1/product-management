import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminSidebar } from './components/admin-sidebar/admin-sidebar';
import { AdminTopbar } from './components/admin-topbar/admin-topbar';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AdminSidebar, AdminTopbar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'onViewportResize()' },
})
export class AdminLayout {
  /** Desktop preference is retained when the viewport changes. */
  readonly sidebarCollapsed = signal(false);
  /** Mobile drawer state is deliberately independent from the desktop preference. */
  readonly sidebarOpen = signal(false);
  readonly isMobile = signal(window.matchMedia('(max-width: 991px)').matches);

  toggleSidebar(): void {
    if (this.isMobile()) {
      this.sidebarOpen.update((open) => !open);
      return;
    }
    this.sidebarCollapsed.update((collapsed) => !collapsed);
  }

  closeMobileSidebar(): void {
    this.sidebarOpen.set(false);
  }

  onViewportResize(): void {
    const mobile = window.matchMedia('(max-width: 991px)').matches;
    this.isMobile.set(mobile);

    if (!mobile) {
      this.closeMobileSidebar();
    }
  }
}
