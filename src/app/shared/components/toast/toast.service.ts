import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 0;

  success(message: string) {
    this.show('success', message);
  }

  error(message: string) {
    this.show('error', message);
  }

  info(message: string) {
    this.show('info', message);
  }

  private show(type: 'success' | 'error' | 'info', message: string) {
    const id = this.nextId++;
    this._toasts.update((t) => [...t, { id, type, message }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => this.remove(id), 5000);
  }

  remove(id: number) {
    this._toasts.update((t) => t.filter((toast) => toast.id !== id));
  }
}
