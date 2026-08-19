import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-topbar',
  imports: [RouterLink],
  templateUrl: './admin-topbar.html',
  styleUrl: './admin-topbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTopbar {
  private readonly authService = inject(AuthService);

  readonly menuToggle = output<void>();
  readonly sidebarExpanded = input(false);

  readonly currentUser = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
  }
}
