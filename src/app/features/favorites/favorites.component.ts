import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../core/models/user.model';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { SocialMockService } from '../../core/services/social-mock.service';
import { ToastService } from '../../core/services/toast.service';
import { UserMockService } from '../../core/services/user-mock.service';
import { HireModalComponent } from '../../shared/components/hire-modal/hire-modal.component';
import { LoginWallComponent } from '../../shared/components/login-wall/login-wall.component';

type FavoriteTab = 'favorites' | 'following';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RouterLink, HireModalComponent, LoginWallComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isAuthenticated()) {
      <section class="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
        <header>
          <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">Tu red</p>
          <h1 class="mt-2 font-display text-3xl font-semibold text-white">Favoritos</h1>
          <p class="mt-2 max-w-lg text-sm text-neutral-400">
            Los fotógrafos que guardaste y los perfiles que seguís.
          </p>
        </header>

        <div class="mt-6 flex gap-2">
          <button type="button" [class]="tabChip('favorites')" (click)="tab.set('favorites')">
            Favoritos ({{ favoriteUsers().length }})
          </button>
          <button type="button" [class]="tabChip('following')" (click)="tab.set('following')">
            Siguiendo ({{ followingUsers().length }})
          </button>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          @for (user of displayed(); track user.id) {
            <article class="flex flex-col rounded-2xl border border-ink-800 bg-ink-900 p-5">
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
                </div>
              </div>
              @if (user.location) {
                <p class="mt-3 text-xs text-neutral-500">{{ user.location }}</p>
              }
              <p class="mt-2 flex-1 text-sm leading-relaxed text-neutral-400">
                {{ user.bio ?? 'Fotografía independiente en ÑanduGrid.' }}
              </p>
              <div class="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                <a [routerLink]="['/u', user.username]" class="btn-secondary px-3 py-2 text-xs">
                  Ver portafolio
                </a>
                <button type="button" class="btn-accent px-3 py-2 text-xs" (click)="openHire(user)">
                  Contratar
                </button>
                <button
                  type="button"
                  class="btn-secondary px-3 py-2 text-xs"
                  (click)="remove(user)"
                >
                  {{ tab() === 'favorites' ? 'Quitar favorito' : 'Dejar de seguir' }}
                </button>
              </div>
            </article>
          } @empty {
            <div class="sm:col-span-2 rounded-2xl border border-dashed border-ink-700 py-16 text-center">
              <p class="text-sm text-neutral-400">
                {{ tab() === 'favorites' ? 'Todavía no guardaste fotógrafos.' : 'Todavía no seguís a nadie.' }}
              </p>
              <a routerLink="/marketplace" class="mt-3 inline-flex text-sm text-accent-300 hover:text-accent-200">
                Explorar fotógrafos
              </a>
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
    } @else {
      <app-login-wall
        variant="page"
        title="Inicia sesión para ver tus favoritos"
        message="Guardá fotógrafos y seguí su trabajo desde tu cuenta."
        actionLabel="Entrar en modo demostración"
      />
    }
  `,
})
export class FavoritesComponent {
  private readonly auth = inject(AuthMockService);
  private readonly users = inject(UserMockService);
  private readonly social = inject(SocialMockService);
  private readonly toast = inject(ToastService);

  readonly currentUser = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly tab = signal<FavoriteTab>('favorites');
  readonly hirePhotographer = signal<User | null>(null);

  readonly favoriteUsers = computed(() => {
    const id = this.currentUser()?.id;
    if (!id) {
      return [];
    }
    return this.social
      .favoriteIds(id)
      .map((photographerId) => this.users.byId(photographerId))
      .filter((user): user is User => Boolean(user));
  });

  readonly followingUsers = computed(() => {
    const id = this.currentUser()?.id;
    if (!id) {
      return [];
    }
    return this.social
      .followingIds(id)
      .map((followingId) => this.users.byId(followingId))
      .filter((user): user is User => Boolean(user));
  });

  readonly displayed = computed(() =>
    this.tab() === 'favorites' ? this.favoriteUsers() : this.followingUsers(),
  );

  tabChip(value: FavoriteTab): string {
    return this.tab() === value
      ? 'chip border-accent-500/40 bg-accent-500/10 text-accent-200'
      : 'chip';
  }

  remove(user: User): void {
    const current = this.currentUser();
    if (!current) {
      return;
    }
    if (this.tab() === 'favorites') {
      this.social.toggleFavorite(current.id, user.id);
      this.toast.show('Eliminado de favoritos', 'info');
      return;
    }
    this.social.toggleFollow(current.id, user.id);
    this.toast.show(`Dejaste de seguir a ${user.displayName}`, 'info');
  }

  openHire(user: User): void {
    this.hirePhotographer.set(user);
  }
}
