import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { BookingRequest } from '../../../core/models/booking.model';
import { AuthMockService } from '../../../core/services/auth-mock.service';
import { BookingMockService } from '../../../core/services/booking-mock.service';
import { PaymentMockService } from '../../../core/services/payment-mock.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[70] flex bg-ink-950/95 p-4 backdrop-blur-md" (click)="onClose.emit()">
      <div
        class="relative m-auto w-full max-w-md overflow-hidden rounded-3xl border border-ink-800 bg-ink-900 shadow-lift"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        (click)="$event.stopPropagation()"
      >
        <button
          type="button"
          class="btn-icon absolute right-3 top-3 z-10 bg-ink-950/60 backdrop-blur"
          aria-label="Cerrar"
          (click)="onClose.emit()"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <form class="space-y-4 p-6" (submit)="pay($event)">
          <header>
            <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">
              Pago simulado
            </p>
            <h2 id="checkout-title" class="mt-2 font-display text-2xl font-semibold text-white">
              Pagar reserva
            </h2>
            <p class="mt-1 text-sm text-neutral-400">
              {{ photographerName() }} · {{ booking().currency }}
              {{ booking().price.toLocaleString('es-PY') }}
            </p>
          </header>

          @if (alreadyPaid()) {
            <div class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              Esta reserva ya tiene un pago aprobado. El original se libera al fotógrafo.
            </div>
          } @else {
            <div class="rounded-xl border border-white/10 bg-ink-950/60 p-3 text-[11px] leading-relaxed text-neutral-400">
              Demo: no se procesa dinero real. Usá la tarjeta de prueba o cualquier número de 16
              dígitos.
            </div>

            <label class="block">
              <span class="field-label">Titular de la tarjeta</span>
              <input
                class="input"
                autocomplete="cc-name"
                required
                [value]="holder()"
                (input)="holder.set($any($event.target).value)"
              />
            </label>

            <label class="block">
              <span class="field-label">Número de tarjeta</span>
              <input
                class="input font-mono tracking-widest"
                inputmode="numeric"
                autocomplete="cc-number"
                placeholder="4242 4242 4242 4242"
                required
                [value]="cardNumber()"
                (input)="onCardInput($event)"
              />
            </label>

            <div class="grid grid-cols-2 gap-3">
              <label>
                <span class="field-label">Vencimiento</span>
                <input
                  class="input font-mono"
                  inputmode="numeric"
                  autocomplete="cc-exp"
                  placeholder="MM/AA"
                  maxlength="5"
                  required
                  [value]="expiry()"
                  (input)="onExpiryInput($event)"
                />
              </label>
              <label>
                <span class="field-label">CVC</span>
                <input
                  class="input font-mono"
                  inputmode="numeric"
                  autocomplete="cc-csc"
                  placeholder="123"
                  maxlength="4"
                  required
                  [value]="cvc()"
                  (input)="onCvcInput($event)"
                />
              </label>
            </div>

            <button
              type="button"
              class="text-xs text-accent-300 transition hover:text-accent-200"
              (click)="fillTestCard()"
            >
              Usar tarjeta de prueba
            </button>

            @if (error()) {
              <p class="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200" role="alert">
                {{ error() }}
              </p>
            }
          }

          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p class="text-[11px] text-neutral-500">Los originales se liberan tras el pago.</p>
            <div class="flex gap-2">
              <button type="button" class="btn-secondary px-4 py-2.5 text-xs" (click)="onClose.emit()">
                Cerrar
              </button>
              @if (!alreadyPaid()) {
                <button type="submit" class="btn-accent px-5 py-2.5 text-xs" [disabled]="!canPay()">
                  Pagar {{ booking().currency }} {{ booking().price.toLocaleString('es-PY') }}
                </button>
              }
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CheckoutModalComponent {
  readonly booking = input.required<BookingRequest>();
  readonly photographerName = input.required<string>();
  readonly onClose = output<void>();
  readonly onPaid = output<void>();

  private readonly auth = inject(AuthMockService);
  private readonly bookings = inject(BookingMockService);
  private readonly payments = inject(PaymentMockService);
  private readonly toast = inject(ToastService);

  readonly holder = signal(this.auth.currentUser()?.displayName ?? '');
  readonly cardNumber = signal('');
  readonly expiry = signal('');
  readonly cvc = signal('');
  readonly error = signal('');

  readonly cardDigits = computed(() => this.cardNumber().replace(/\D/g, ''));
  readonly alreadyPaid = computed(() => Boolean(this.payments.byBooking(this.booking().id)));
  readonly canPay = computed(
    () =>
      this.cardDigits().length === 16 &&
      this.holder().trim().length >= 3 &&
      /^(0[1-9]|1[0-2])\/\d{2}$/.test(this.expiry()) &&
      /^\d{3,4}$/.test(this.cvc()),
  );

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onClose.emit();
  }

  onCardInput(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 16);
    const grouped = digits.replace(/(.{4})/g, '$1 ').trim();
    this.cardNumber.set(grouped);
    this.error.set('');
  }

  onExpiryInput(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4);
    this.expiry.set(digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
    this.error.set('');
  }

  onCvcInput(event: Event): void {
    this.cvc.set((event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4));
    this.error.set('');
  }

  fillTestCard(): void {
    this.cardNumber.set('4242 4242 4242 4242');
    this.expiry.set('12/30');
    this.cvc.set('123');
    this.error.set('');
  }

  pay(event: Event): void {
    event.preventDefault();
    if (this.alreadyPaid()) {
      return;
    }
    if (!this.canPay()) {
      this.error.set('Revisá los datos de la tarjeta para continuar.');
      return;
    }
    const user = this.auth.currentUser();
    if (!user) {
      this.error.set('Iniciá sesión para completar el pago.');
      return;
    }
    const booking = this.booking();
    this.payments.create({
      bookingId: booking.id,
      userId: user.id,
      amount: booking.price,
      currency: booking.currency,
    });
    this.bookings.updateStatus(booking.id, 'completed');
    this.toast.show('Pago aprobado (demo)');
    this.onPaid.emit();
    this.onClose.emit();
  }
}
