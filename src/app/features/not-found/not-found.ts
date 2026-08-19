import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  private readonly queryMessage = toSignal(
    this.route.queryParamMap.pipe(map((p) => p.get('message'))),
    { initialValue: null },
  );

  readonly state = computed(() => {
    const isLoggedIn = this.auth.isAuthenticated();
    const qMessage = this.queryMessage();
    const isProductError = qMessage?.toLowerCase().includes('product');

    if (isProductError) {
      return {
        message: 'No product found.',
        buttonText: isLoggedIn ? 'Back to Products Dashboard' : 'Back to Products',
        buttonLink: isLoggedIn ? '/admin/products' : '/products'
      };
    }

    if (!isLoggedIn) {
      return {
        message: 'Page not found. Go to log in.',
        buttonText: 'Go to Log In',
        buttonLink: '/login'
      };
    }

    return {
      message: 'There is no page here.',
      buttonText: 'Back to Dashboard',
      buttonLink: '/admin/products'
    };
  });
}
