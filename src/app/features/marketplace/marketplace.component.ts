import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../core/models/user.model';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { PhotoMockService } from '../../core/services/photo-mock.service';
import { ServiceMockService } from '../../core/services/service-mock.service';
import { SocialMockService } from '../../core/services/social-mock.service';
import { ToastService } from '../../core/services/toast.service';
import { UserMockService } from '../../core/services/user-mock.service';
import { Reputation, calculateReputation } from '../../core/utils/reputation';
import { HireModalComponent } from '../../shared/components/hire-modal/hire-modal.component';
import { LoginWallComponent } from '../../shared/components/login-wall/login-wall.component';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [RouterLink, HireModalComponent, LoginWallComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
      <header class="animate-fade-in">
        <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">Directorio</p>
        <h1 class="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Fotógrafos
        </h1>
        <p class="mt-2 max-w-lg text-sm leading-relaxed text-neutral-400">
          Descubrí fotógrafos, seguí su trabajo y contratá servicios para tu próximo proyecto.
        </p>
      </header>

      <div class="mt-6 flex flex-col gap-3">
        <input
          type="search"
          class="input max-w-md"
          placeholder="Buscar por nombre, usuario o ciudad..."
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
        <div class="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <button type="button" [class]="specialtyChip(null)" (click)="specialtyFilter.set(null)">
            Todas
          </button>
          @for (specialty of specialties(); track specialty) {
            <button
              type="button"
              [class]="specialtyChip(specialty)"
              (click)="specialtyFilter.set(specialty)"
            >
              {{ specialty }}
            </button>
          }
        </div>
      </div>

      @if (loginWall()) {
        <app-login-wall class="mt-5 block" (onLogin)="loginWall.set(false)" />
      }

      <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        @for (user of photographers(); track user.id) {
          <article class="flex flex-col rounded-3xl border border-ink-800 bg-ink-900 p-6">
            <div class="flex items-center gap-3">
              @if (user.avatarUrl) {
                <img
                  [src]="user.avatarUrl"
                  [alt]="'Foto de ' + user.displayName"
                  class="h-12 w-12 rounded-full object-cover ring-1 ring-white/10"
                />
              } @else {
                <div class="h-12 w-12 rounded-full bg-gradient-to-br from-accent-300 to-accent-700"></div>
              }
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-white">{{ user.displayName }}</p>
                <p class="truncate text-[11px] text-neutral-500">&#64;{{ user.username }}</p>
                @if (reputation(user.id); as rep) {
                  <span
                    class="mt-1 inline-flex rounded-full border border-accent-500/30 px-2 py-0.5 text-[10px] text-accent-300"
                    [title]="'Reputación: ' + rep.score + ' pts'"
                  >
                    {{ rep.level }}
                  </span>
                }
              </div>
              @if (isOwnProfile(user)) {
                <span class="ml-auto rounded-full border border-accent-500/30 px-2 py-0.5 text-[10px] text-accent-300">
                  Tú
                </span>
              }
            </div>

            @if (user.location) {
              <p class="mt-3 text-xs text-neutral-500">{{ user.location }}</p>
            }
            <p class="mt-2 flex-1 text-sm leading-relaxed text-neutral-400">
              {{ user.bio ?? 'Fotografía independiente en ÑanduGrid.' }}
            </p>

            @if (user.specialties?.length) {
              <div class="mt-3 flex flex-wrap gap-1.5">
                @for (specialty of user.specialties ?? []; track specialty) {
                  <span class="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-neutral-400">
                    {{ specialty }}
                  </span>
                }
              </div>
            }

            <div class="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <p class="text-xs text-neutral-500">
                @if (minPrice(user.id); as price) {
                  Desde <span class="text-accent-300">USD {{ price }}</span>
                } @else {
                  Sin servicios publicados
                }
              </p>
              <a [routerLink]="['/u', user.username]" class="text-xs text-accent-300 hover:text-accent-200">
                Ver portafolio
              </a>
            </div>

            @if (!isOwnProfile(user)) {
              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="btn-accent px-3 py-2 text-xs"
                  (click)="openHire(user)"
                >
                  Contratar
                </button>
                <button
                  type="button"
                  class="btn-secondary px-3 py-2 text-xs"
                  (click)="openMessage(user)"
                >
                  Mensaje
                </button>
                <button
                  type="button"
                  class="btn-secondary px-3 py-2 text-xs"
                  [class.border-accent-500]="isFollowing(user.id)"
                  [class.text-accent-300]="isFollowing(user.id)"
                  (click)="toggleFollow(user)"
                >
                  {{ isFollowing(user.id) ? 'Siguiendo' : 'Seguir' }}
                </button>
                <button
                  type="button"
                  class="btn-secondary px-3 py-2 text-xs"
                  [class.border-accent-500]="isFavorite(user.id)"
                  [class.text-accent-300]="isFavorite(user.id)"
                  (click)="toggleFavorite(user)"
                >
                  {{ isFavorite(user.id) ? '★' : '☆' }}
                </button>
              </div>
            }
          </article>
        } @empty {
          <div class="sm:col-span-2 lg:col-span-3 border-y border-white/10 py-16 text-center">
            <p class="text-sm text-neutral-400">No encontramos fotógrafos con esos filtros.</p>
            <button type="button" class="mt-3 text-sm text-accent-300 hover:text-accent-200" (click)="resetFilters()">
              Limpiar filtros
            </button>
          </div>
        }
      </div>

      @if (hirePhotographer(); as photographer) {
        <app-hire-modal
          [photographer]="photographer"
          (onClose)="hirePhotographer.set(null)"
        />
      }
    </section>
  `,
})
export class MarketplaceComponent {
  private readonly auth = inject(AuthMockService);
  private readonly users = inject(UserMockService);
  private readonly services = inject(ServiceMockService);
  private readonly photos = inject(PhotoMockService);
  private readonly social = inject(SocialMockService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;
  readonly query = signal('');
  readonly specialtyFilter = signal<string | null>(null);
  readonly loginWall = signal(false);
  readonly hirePhotographer = signal<User | null>(null);

  readonly specialties = computed(() => {
    const all = new Set<string>();
    this.users.all().forEach((user) => (user.specialties ?? []).forEach((item) => all.add(item)));
    return [...all].sort((a, b) => a.localeCompare(b));
  });

  readonly photographers = computed(() => {
    const query = this.query().trim().toLowerCase();
    const specialty = this.specialtyFilter();
    return this.users
      .all()
      .filter((user) => {
        const matchesQuery =
          !query ||
          user.displayName.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          (user.location ?? '').toLowerCase().includes(query);
        const matchesSpecialty = !specialty || (user.specialties ?? []).includes(specialty);
        return matchesQuery && matchesSpecialty;
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  });

  specialtyChip(value: string | null): string {
    return this.specialtyFilter() === value
      ? 'chip border-accent-500/40 bg-accent-500/10 text-accent-200'
      : 'chip';
  }

  isOwnProfile(user: User): boolean {
    return this.currentUser()?.id === user.id;
  }

  reputation(userId: string): Reputation {
    const photos = this.photos.getByAuthorId(userId);
    const upvotes = photos.reduce((total, photo) => total + photo.upvotes, 0);
    return calculateReputation(upvotes, photos.length, this.social.followerIds(userId).length);
  }

  minPrice(ownerId: string): number | null {
    return this.services.minPrice(ownerId);
  }

  isFollowing(userId: string): boolean {
    const current = this.currentUser();
    return Boolean(current && this.social.isFollowing(current.id, userId));
  }

  isFavorite(userId: string): boolean {
    const current = this.currentUser();
    return Boolean(current && this.social.isFavorite(current.id, userId));
  }

  toggleFollow(user: User): void {
    const current = this.currentUser();
    if (!current) {
      this.loginWall.set(true);
      return;
    }
    const following = this.social.toggleFollow(current.id, user.id);
    this.toast.show(
      following ? `Ahora sigues a ${user.displayName}` : `Dejaste de seguir a ${user.displayName}`,
      following ? 'success' : 'info',
    );
  }

  toggleFavorite(user: User): void {
    const current = this.currentUser();
    if (!current) {
      this.loginWall.set(true);
      return;
    }
    const favorite = this.social.toggleFavorite(current.id, user.id);
    this.toast.show(
      favorite ? 'Añadido a favoritos' : 'Eliminado de favoritos',
      favorite ? 'success' : 'info',
    );
  }

  openHire(user: User): void {
    if (!this.auth.isAuthenticated()) {
      this.loginWall.set(true);
      return;
    }
    this.hirePhotographer.set(user);
  }

  openMessage(user: User): void {
    if (!this.auth.isAuthenticated()) {
      this.loginWall.set(true);
      return;
    }
    void this.router.navigate(['/messages'], { queryParams: { with: user.username } });
  }

  resetFilters(): void {
    this.query.set('');
    this.specialtyFilter.set(null);
  }
}
