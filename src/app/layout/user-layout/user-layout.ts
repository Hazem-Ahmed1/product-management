import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-layout',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserLayout {
  private readonly authService = inject(AuthService);
  readonly currentUser = this.authService.currentUser;
}
