import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  close(id: number) {
    this.toastService.remove(id);
  }
}
