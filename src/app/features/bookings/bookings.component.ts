import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { BookingRequest, BookingStatus } from '../../core/models/booking.model';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { BookingMockService } from '../../core/services/booking-mock.service';
import { ServiceMockService } from '../../core/services/service-mock.service';
import { ToastService } from '../../core/services/toast.service';
import { UserMockService } from '../../core/services/user-mock.service';
import { LoginWallComponent } from '../../shared/components/login-wall/login-wall.component';

type BookingTab = 'received' | 'sent';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [LoginWallComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isAuthenticated()) {
      <section class="mx-auto max-w-4xl px-4 pb-24 pt-10 sm:px-6">
        <header>
          <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">Solicitudes</p>
          <h1 class="mt-2 font-display text-3xl font-semibold text-white">Reservas</h1>
          <p class="mt-2 max-w-lg text-sm text-neutral-400">
            Gestioná las solicitudes que recibís y seguí el estado de las que enviaste.
          </p>
        </header>

        <div class="mt-6 flex gap-2">
          <button type="button" [class]="tabChip('received')" (click)="tab.set('received')">
            Recibidas ({{ received().length }})
          </button>
          <button type="button" [class]="tabChip('sent')" (click)="tab.set('sent')">
            Enviadas ({{ sent().length }})
          </button>
        </div>

        <div class="mt-6 space-y-4">
          @for (booking of displayed(); track booking.id) {
            <article class="rounded-2xl border border-ink-800 bg-ink-900 p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-medium text-white">
                    {{ counterpart(booking) }}
                  </p>
                  <p class="mt-1 text-xs text-neutral-500">
                    {{ serviceTitle(booking) }} · {{ formatDate(booking.eventDate) }}
                  </p>
                </div>
                <span
                  class="rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider"
                  [class]="statusClass(booking.status)"
                >
                  {{ statusLabel(booking.status) }}
                </span>
              </div>

              <p class="mt-3 text-sm leading-relaxed text-neutral-300">{{ booking.message }}</p>

              <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <p class="text-sm text-accent-300">
                  {{ booking.currency }} {{ booking.price.toLocaleString('es-PY') }}
                </p>

                <div class="flex flex-wrap gap-2">
                  @if (tab() === 'received' && booking.status === 'pending') {
                    <button
                      type="button"
                      class="btn-accent px-4 py-2 text-xs"
                      (click)="updateStatus(booking, 'accepted')"
                    >
                      Aceptar
                    </button>
                    <button
                      type="button"
                      class="btn-secondary border-red-500/30 px-4 py-2 text-xs text-red-300"
                      (click)="updateStatus(booking, 'declined')"
                    >
                      Rechazar
                    </button>
                  }
                  @if (tab() === 'received' && booking.status === 'accepted') {
                    <button
                      type="button"
                      class="btn-secondary px-4 py-2 text-xs"
                      (click)="updateStatus(booking, 'completed')"
                    >
                      Marcar completada
                    </button>
                  }
                  @if (tab() === 'sent' && booking.status === 'pending') {
                    <button
                      type="button"
                      class="btn-secondary px-4 py-2 text-xs"
                      (click)="updateStatus(booking, 'declined')"
                    >
                      Cancelar solicitud
                    </button>
                  }
                </div>
              </div>
            </article>
          } @empty {
            <div class="rounded-2xl border border-dashed border-ink-700 py-16 text-center">
              <p class="text-sm text-neutral-400">
                {{ tab() === 'received' ? 'No recibiste solicitudes todavía.' : 'No enviaste solicitudes todavía.' }}
              </p>
              <p class="mt-1 text-xs text-neutral-500">
                {{ tab() === 'received' ? 'Publicá servicios para que te contacten.' : 'Explorá fotógrafos y solicitá un servicio.' }}
              </p>
            </div>
          }
        </div>
      </section>
    } @else {
      <app-login-wall
        variant="page"
        title="Inicia sesión para ver tus reservas"
        message="Las solicitudes enviadas y recibidas solo son visibles para ti."
        actionLabel="Entrar en modo demostración"
      />
    }
  `,
})
export class BookingsComponent {
  private readonly auth = inject(AuthMockService);
  private readonly bookingService = inject(BookingMockService);
  private readonly serviceService = inject(ServiceMockService);
  private readonly users = inject(UserMockService);
  private readonly toast = inject(ToastService);

  readonly currentUser = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly tab = signal<BookingTab>('received');

  readonly received = computed(() => {
    const id = this.currentUser()?.id;
    return id ? this.bookingService.received(id) : [];
  });
  readonly sent = computed(() => {
    const id = this.currentUser()?.id;
    return id ? this.bookingService.sent(id) : [];
  });
  readonly displayed = computed(() => (this.tab() === 'received' ? this.received() : this.sent()));

  tabChip(value: BookingTab): string {
    return this.tab() === value
      ? 'chip border-accent-500/40 bg-accent-500/10 text-accent-200'
      : 'chip';
  }

  counterpart(booking: BookingRequest): string {
    const id = this.tab() === 'received' ? booking.clientId : booking.photographerId;
    return this.users.byId(id)?.displayName ?? 'Usuario';
  }

  serviceTitle(booking: BookingRequest): string {
    if (!booking.serviceId) {
      return 'Solicitud directa';
    }
    return this.serviceService.byId(booking.serviceId)?.title ?? 'Servicio';
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('es-PY', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  statusLabel(status: BookingStatus): string {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'accepted':
        return 'Aceptada';
      case 'declined':
        return 'Rechazada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  }

  statusClass(status: BookingStatus): string {
    switch (status) {
      case 'pending':
        return 'border-amber-500/40 text-amber-300';
      case 'accepted':
        return 'border-emerald-500/40 text-emerald-300';
      case 'declined':
        return 'border-red-500/40 text-red-300';
      case 'completed':
        return 'border-accent-500/40 text-accent-300';
      default:
        return 'border-white/10 text-neutral-400';
    }
  }

  updateStatus(booking: BookingRequest, status: BookingStatus): void {
    this.bookingService.updateStatus(booking.id, status);
    this.toast.show(`Solicitud ${this.statusLabel(status).toLowerCase()}`, 'info');
  }
}
