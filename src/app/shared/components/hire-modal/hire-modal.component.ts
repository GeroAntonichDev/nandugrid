import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Photo } from '../../../core/models/photo.model';
import { Service } from '../../../core/models/service.model';
import { User } from '../../../core/models/user.model';
import { AuthMockService } from '../../../core/services/auth-mock.service';
import { BookingMockService } from '../../../core/services/booking-mock.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-hire-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[60] flex bg-ink-950/95 p-4 backdrop-blur-md" (click)="onClose.emit()">
      <div
        class="relative m-auto w-full max-w-lg overflow-hidden rounded-3xl border border-ink-800 bg-ink-900 shadow-lift"
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

        @if (submitted()) {
          <div class="px-8 py-14 text-center">
            <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 class="mt-5 font-display text-2xl font-semibold text-white">Solicitud enviada</h2>
            <p class="mt-2 text-sm leading-relaxed text-neutral-400">
              {{ photographer.displayName }} recibirá tu solicitud y podrá aceptarla o rechazarla
              desde su bandeja.
            </p>
            <button type="button" class="btn-accent mt-6" (click)="onClose.emit()">Cerrar</button>
          </div>
        } @else {
          <form class="space-y-4 p-6" (submit)="submit($event)">
            <header>
              <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">
                Contratación
              </p>
              <h2 class="mt-2 font-display text-2xl font-semibold text-white">
                Solicitar a {{ photographer.displayName }}
              </h2>
              @if (service) {
                <p class="mt-1 text-sm text-neutral-400">
                  {{ service.title }} · {{ service.price }} {{ service.currency }}
                </p>
              } @else if (photo) {
                <p class="mt-1 text-sm text-neutral-400">{{ photo.title }}</p>
              }
            </header>

            <div class="grid gap-4 sm:grid-cols-2">
              <label>
                <span class="field-label">Tu nombre</span>
                <input
                  class="input"
                  required
                  maxlength="60"
                  [value]="name()"
                  (input)="name.set($any($event.target).value)"
                />
              </label>
              <label>
                <span class="field-label">Email de contacto</span>
                <input
                  class="input"
                  type="email"
                  required
                  [value]="email()"
                  (input)="email.set($any($event.target).value)"
                />
              </label>
              <label>
                <span class="field-label">Fecha del evento</span>
                <input
                  class="input"
                  type="date"
                  required
                  [value]="eventDate()"
                  (input)="eventDate.set($any($event.target).value)"
                />
              </label>
              <label>
                <span class="field-label">Presupuesto ({{ currency }})</span>
                <input
                  class="input"
                  type="number"
                  min="1"
                  required
                  [value]="budget() ?? ''"
                  (input)="budget.set($any($event.target).valueAsNumber || null)"
                />
              </label>
            </div>

            <label class="block">
              <span class="field-label">Mensaje</span>
              <textarea
                class="input min-h-24 resize-y"
                required
                maxlength="400"
                placeholder="Contale qué necesitás y para cuándo..."
                [value]="message()"
                (input)="message.set($any($event.target).value)"
              ></textarea>
            </label>

            <div class="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p class="text-[11px] text-neutral-500">La solicitud queda en estado pendiente.</p>
              <div class="flex gap-2">
                <button type="button" class="btn-secondary px-4 py-2.5 text-xs" (click)="onClose.emit()">
                  Cancelar
                </button>
                <button type="submit" class="btn-accent px-5 py-2.5 text-xs" [disabled]="!canSubmit()">
                  Enviar solicitud
                </button>
              </div>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class HireModalComponent implements OnInit {
  @Input({ required: true }) photographer!: User;
  @Input() service?: Service;
  @Input() photo?: Photo;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmitted = new EventEmitter<void>();

  private readonly auth = inject(AuthMockService);
  private readonly bookings = inject(BookingMockService);
  private readonly toast = inject(ToastService);

  readonly name = signal(this.auth.currentUser()?.displayName ?? '');
  readonly email = signal(this.auth.currentUser()?.contactEmail ?? '');
  readonly eventDate = signal('');
  readonly budget = signal<number | null>(null);
  readonly message = signal('');
  readonly submitted = signal(false);

  get currency(): string {
    return this.service?.currency ?? 'USD';
  }

  readonly canSubmit = computed(() => {
    const budget = this.budget();
    return Boolean(
      this.name().trim() &&
        this.email().trim() &&
        this.eventDate() &&
        budget &&
        budget > 0 &&
        this.message().trim(),
    );
  });

  ngOnInit(): void {
    this.budget.set(this.service?.price ?? this.photo?.price ?? null);
  }

  submit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit()) {
      return;
    }
    const client = this.auth.currentUser();
    const budget = this.budget();
    if (!client || !budget) {
      return;
    }
    this.bookings.create({
      clientId: client.id,
      photographerId: this.photographer.id,
      serviceId: this.service?.id,
      photoId: this.photo?.id,
      price: budget,
      currency: this.currency,
      eventDate: this.eventDate(),
      message: this.message().trim(),
    });
    this.toast.show(`Solicitud enviada a ${this.photographer.displayName}`);
    this.submitted.set(true);
    this.onSubmitted.emit();
  }
}
