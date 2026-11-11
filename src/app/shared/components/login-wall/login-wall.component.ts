import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { AuthMockService } from '../../../core/services/auth-mock.service';

type LoginWallVariant = 'banner' | 'floating' | 'page' | 'panel';

@Component({
  selector: 'app-login-wall',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (variant) {
      @case ('page') {
        <section class="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
          <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">Acceso privado</p>
          <h1 class="mt-3 font-display text-3xl font-semibold text-white">{{ title }}</h1>
          <p class="mt-3 text-sm text-neutral-400">{{ message }}</p>
          <button type="button" class="btn-accent mt-8" (click)="login()">{{ actionLabel }}</button>
        </section>
      }
      @case ('floating') {
        <div
          class="fixed inset-x-4 bottom-5 z-40 mx-auto flex max-w-lg items-center justify-between gap-4 rounded-lg border border-accent-500/30 bg-ink-900 p-4 shadow-soft"
          role="status"
        >
          <p class="text-sm text-neutral-200">{{ message }}</p>
          <button type="button" class="btn-accent shrink-0 px-4 py-2.5 text-xs" (click)="login()">
            {{ actionLabel }}
          </button>
        </div>
      }
      @case ('panel') {
        <div class="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <h3 class="font-display text-lg font-medium text-white">{{ title }}</h3>
          <p class="mt-2 max-w-xs text-sm leading-relaxed text-neutral-400">{{ message }}</p>
          <button type="button" class="btn-accent mt-5 px-5 py-3" (click)="login()">
            {{ actionLabel }}
          </button>
        </div>
      }
      @default {
        <div
          class="flex flex-wrap items-center justify-between gap-3 border-l-2 border-accent-500 bg-white/[0.03] px-4 py-3"
          role="status"
        >
          <p class="text-sm text-neutral-300">{{ message }}</p>
          <button type="button" class="btn-accent px-4 py-2 text-xs" (click)="login()">
            {{ actionLabel }}
          </button>
        </div>
      }
    }
  `,
})
export class LoginWallComponent {
  private readonly auth = inject(AuthMockService);

  @Input() variant: LoginWallVariant = 'banner';
  @Input() title = 'Inicia sesión para continuar';
  @Input() message = 'Inicia sesión para dar upvotes a las fotos.';
  @Input() actionLabel = 'Entrar en modo demo';
  @Output() onLogin = new EventEmitter<void>();

  login(): void {
    void this.auth.login();
    this.onLogin.emit();
  }
}
