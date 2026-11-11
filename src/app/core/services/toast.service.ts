import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'info' | 'error';

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, tone: ToastTone = 'success'): void {
    const id = globalThis.crypto?.randomUUID?.() ?? `toast-${Date.now()}`;
    this._toasts.update((toasts) => [...toasts, { id, message, tone }]);
    setTimeout(() => this.dismiss(id), 3200);
  }

  dismiss(id: string): void {
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}
