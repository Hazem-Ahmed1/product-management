import { ChangeDetectionStrategy, Component, input, output, ViewChild, ElementRef, effect, OnInit, OnDestroy } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModal implements OnInit, OnDestroy {
  readonly isOpen = input<boolean>(false);
  readonly title = input<string>('Confirm Action');
  readonly message = input<string>('Are you sure you want to proceed?');
  readonly confirmText = input<string>('Confirm');
  readonly cancelText = input<string>('Cancel');
  readonly isDestructive = input<boolean>(false);
  readonly isProcessing = input<boolean>(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  @ViewChild('modalElement') modalElement!: ElementRef<HTMLDivElement>;
  private bsModal: any;

  constructor(private host: ElementRef) {
    effect(() => {
      const open = this.isOpen();
      if (this.modalElement?.nativeElement) {
        if (!this.bsModal && typeof bootstrap !== 'undefined') {
          this.bsModal = new bootstrap.Modal(this.modalElement.nativeElement, {
            backdrop: 'static',
            keyboard: false
          });
        }
        
        if (this.bsModal) {
          if (open) {
            this.bsModal.show();
          } else {
            this.bsModal.hide();
          }
        }
      }
    });
  }

  ngOnInit() {
    // Append the modal to the body to escape the CSS stacking context
    document.body.appendChild(this.host.nativeElement);
  }

  ngOnDestroy() {
    if (this.bsModal) {
      this.bsModal.dispose();
    }
    this.host.nativeElement.remove();
  }

  onConfirm(): void {
    if (!this.isProcessing()) {
      this.confirm.emit();
    }
  }

  onCancel(): void {
    if (!this.isProcessing()) {
      this.cancel.emit();
    }
  }
}
