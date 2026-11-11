import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, ToastTone } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pointer-events-none fixed inset-x-4 bottom-5 z-[60] flex flex-col items-center gap-2 sm:left-auto sm:right-6 sm:items-end"
      aria-live="polite"
    >
      @for (toast of toasts(); track toast.id) {
        <button
          type="button"
          [class]="toastClass(toast.tone)"
          (click)="dismiss(toast.id)"
        >
          {{ toast.message }}
        </button>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  toastClass(tone: ToastTone): string {
    const base =
      'pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 text-left text-sm shadow-soft backdrop-blur';
    if (tone === 'error') {
      return `${base} border-red-500/40 bg-red-950/85 text-red-100`;
    }
    if (tone === 'info') {
      return `${base} border-white/15 bg-ink-900/90 text-neutral-100`;
    }
    return `${base} border-emerald-500/40 bg-emerald-950/85 text-emerald-100`;
  }
}
