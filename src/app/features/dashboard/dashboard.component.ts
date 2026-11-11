import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { BookingMockService } from '../../core/services/booking-mock.service';
import { PhotoMockService } from '../../core/services/photo-mock.service';
import { ServiceMockService } from '../../core/services/service-mock.service';
import { StorageService } from '../../core/services/storage.service';
import { ToastService } from '../../core/services/toast.service';
import { LoginWallComponent } from '../../shared/components/login-wall/login-wall.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LoginWallComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isAuthenticated()) {
      <section class="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
        <header class="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">Espacio privado</p>
            <h1 class="mt-2 font-display text-3xl font-semibold text-white">Panel del fotógrafo</h1>
            <p class="mt-2 text-sm text-neutral-400">
              Hola, {{ currentUser()?.displayName }}. Así va tu trabajo en ÑanduGrid.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a routerLink="/account/profile" class="btn-secondary px-4 py-3">Editar perfil</a>
            <a routerLink="/upload" class="btn-accent px-5 py-3">Publicar una foto</a>
          </div>
        </header>

        <div class="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-5">
          <article class="bg-ink-900 p-5">
            <p class="text-xs uppercase tracking-[0.16em] text-neutral-500">Publicaciones</p>
            <p class="mt-3 font-display text-3xl text-white">{{ photos().length }}</p>
          </article>
          <article class="bg-ink-900 p-5">
            <p class="text-xs uppercase tracking-[0.16em] text-neutral-500">Upvotes</p>
            <p class="mt-3 font-display text-3xl text-white">{{ totalUpvotes() }}</p>
          </article>
          <article class="bg-ink-900 p-5">
            <p class="text-xs uppercase tracking-[0.16em] text-neutral-500">Comentarios</p>
            <p class="mt-3 font-display text-3xl text-white">{{ totalComments() }}</p>
          </article>
          <article class="bg-ink-900 p-5">
            <p class="text-xs uppercase tracking-[0.16em] text-neutral-500">Servicios</p>
            <p class="mt-3 font-display text-3xl text-white">{{ servicesCount() }}</p>
          </article>
          <article class="bg-ink-900 p-5">
            <p class="text-xs uppercase tracking-[0.16em] text-neutral-500">Solicitudes</p>
            <p class="mt-3 font-display text-3xl text-white">{{ pendingBookings() }}</p>
          </article>
        </div>

        <section class="mt-10" aria-labelledby="quick-title">
          <h2 id="quick-title" class="border-b border-white/10 pb-3 font-display text-xl font-medium text-white">
            Accesos rápidos
          </h2>
          <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <a routerLink="/services" class="rounded-2xl border border-ink-800 bg-ink-900 p-4 transition hover:border-accent-500/50">
              <p class="text-sm font-medium text-white">Gestionar servicios</p>
              <p class="mt-1 text-xs text-neutral-500">Publicá, editá o pausá tus servicios.</p>
            </a>
            <a routerLink="/bookings" class="rounded-2xl border border-ink-800 bg-ink-900 p-4 transition hover:border-accent-500/50">
              <p class="text-sm font-medium text-white">Reservas</p>
              <p class="mt-1 text-xs text-neutral-500">
                {{ pendingBookings() }} solicitud(es) pendiente(s).
              </p>
            </a>
            <a routerLink="/favorites" class="rounded-2xl border border-ink-800 bg-ink-900 p-4 transition hover:border-accent-500/50">
              <p class="text-sm font-medium text-white">Favoritos</p>
              <p class="mt-1 text-xs text-neutral-500">Los fotógrafos que guardaste.</p>
            </a>
            <a routerLink="/marketplace" class="rounded-2xl border border-ink-800 bg-ink-900 p-4 transition hover:border-accent-500/50">
              <p class="text-sm font-medium text-white">Explorar fotógrafos</p>
              <p class="mt-1 text-xs text-neutral-500">Descubrí talento y seguí perfiles.</p>
            </a>
            <a routerLink="/upload" class="rounded-2xl border border-ink-800 bg-ink-900 p-4 transition hover:border-accent-500/50">
              <p class="text-sm font-medium text-white">Subir una foto</p>
              <p class="mt-1 text-xs text-neutral-500">Hobby, feedback o comercial.</p>
            </a>
            <button
              type="button"
              class="rounded-2xl border border-ink-800 bg-ink-900 p-4 text-left transition hover:border-red-500/50"
              (click)="resetDemo()"
            >
              <p class="text-sm font-medium text-white">Reiniciar datos demo</p>
              <p class="mt-1 text-xs text-neutral-500">Borra fotos, servicios y reservas guardadas.</p>
            </button>
          </div>
        </section>

        <section class="mt-10" aria-labelledby="publications-title">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 id="publications-title" class="font-display text-xl font-medium text-white">Tus publicaciones</h2>
            <a [routerLink]="['/u', currentUser()?.username]" class="text-sm text-accent-300 hover:text-accent-200">
              Ver portafolio
            </a>
          </div>
          <div class="divide-y divide-white/10">
            @for (photo of photos(); track photo.id) {
              <article class="flex items-center gap-4 py-4">
                <img [src]="photo.url" [alt]="photo.title" class="h-16 w-20 shrink-0 rounded-md object-cover" />
                <div class="min-w-0 flex-1">
                  <h3 class="truncate text-sm font-medium text-white">{{ photo.title }}</h3>
                  <p class="mt-1 text-xs text-neutral-500">
                    {{ photo.upvotes }} upvotes · {{ photo.category }} · {{ purposeLabel(photo.purpose) }}
                  </p>
                </div>
                <button
                  type="button"
                  class="btn-secondary shrink-0 px-3 py-2 text-xs"
                  [attr.aria-label]="'Eliminar ' + photo.title"
                  (click)="removePhoto(photo.id)"
                >
                  Eliminar
                </button>
              </article>
            } @empty {
              <div class="py-12 text-center">
                <p class="text-sm text-neutral-400">Todavía no publicaste fotos.</p>
                <a routerLink="/upload" class="mt-4 inline-flex text-sm text-accent-300 hover:text-accent-200">
                  Subir tu primera foto
                </a>
              </div>
            }
          </div>
        </section>
      </section>
    } @else {
      <app-login-wall
        variant="page"
        title="Inicia sesión para ver tu panel"
        message="Las métricas y publicaciones de tu cuenta solo son visibles para ti."
        actionLabel="Entrar en modo demostración"
      />
    }
  `,
})
export class DashboardComponent {
  private readonly auth = inject(AuthMockService);
  private readonly photoService = inject(PhotoMockService);
  private readonly serviceService = inject(ServiceMockService);
  private readonly bookingService = inject(BookingMockService);
  private readonly storage = inject(StorageService);
  private readonly toast = inject(ToastService);

  readonly currentUser = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly photos = computed(() => {
    const id = this.currentUser()?.id;
    return id ? this.photoService.getByAuthorId(id) : [];
  });
  readonly totalUpvotes = computed(() =>
    this.photos().reduce((total, photo) => total + photo.upvotes, 0),
  );
  readonly totalComments = computed(() => {
    const photoIds = new Set(this.photos().map((photo) => photo.id));
    return this.photoService.comments().filter((comment) => photoIds.has(comment.photoId)).length;
  });
  readonly servicesCount = computed(() => {
    const id = this.currentUser()?.id;
    return id ? this.serviceService.byOwner(id).length : 0;
  });
  readonly pendingBookings = computed(() => {
    const id = this.currentUser()?.id;
    return id ? this.bookingService.pendingReceived(id) : 0;
  });

  purposeLabel(purpose: string): string {
    if (purpose === 'hobby') {
      return 'Hobby';
    }
    if (purpose === 'feedback') {
      return 'Feedback';
    }
    return 'Comercial';
  }

  removePhoto(id: string): void {
    this.photoService.removePhoto(id);
    this.toast.show('Publicación eliminada', 'info');
  }

  resetDemo(): void {
    this.storage.clearAll();
    this.toast.show('Datos demo reiniciados. Recargando…', 'info');
    setTimeout(() => globalThis.location?.reload(), 600);
  }
}
