import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Photo } from '../../core/models/photo.model';
import { Service } from '../../core/models/service.model';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { PhotoMockService } from '../../core/services/photo-mock.service';
import { ServiceMockService } from '../../core/services/service-mock.service';
import { SocialMockService } from '../../core/services/social-mock.service';
import { ToastService } from '../../core/services/toast.service';
import { UserMockService } from '../../core/services/user-mock.service';
import { calculateReputation } from '../../core/utils/reputation';
import { HireModalComponent } from '../../shared/components/hire-modal/hire-modal.component';
import { LoginWallComponent } from '../../shared/components/login-wall/login-wall.component';
import { PhotoCardComponent } from '../../shared/components/photo-card/photo-card.component';
import { PhotoDetailModalComponent } from '../../shared/components/photo-detail-modal/photo-detail-modal.component';

type PortfolioTab = 'services' | 'commercial' | 'community' | 'team';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    RouterLink,
    PhotoCardComponent,
    PhotoDetailModalComponent,
    LoginWallComponent,
    HireModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
      @if (profile(); as user) {
        <header class="grid gap-8 border-b border-white/10 pb-8 md:grid-cols-[1fr_auto] md:items-end">
          <div class="flex items-start gap-5">
            @if (user.avatarUrl) {
              <img
                [src]="user.avatarUrl"
                [alt]="'Foto de ' + user.displayName"
                class="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-white/15"
              />
            } @else {
              <div
                class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-700 font-display text-2xl text-white ring-1 ring-white/15"
              >
                {{ initials() }}
              </div>
            }
            <div class="min-w-0">
              <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">
                Portafolio
              </p>
              <h1 class="mt-2 font-display text-3xl font-semibold text-white">
                {{ user.displayName }}
              </h1>
              <p class="mt-1 text-sm text-neutral-500">&#64;{{ user.username }}</p>
              @if (user.location) {
                <p class="mt-1 text-sm text-neutral-400">{{ user.location }}</p>
              }
              <p class="mt-3 max-w-xl text-sm leading-relaxed text-neutral-400">
                {{ user.bio ?? 'Fotografía independiente en ÑanduGrid.' }}
              </p>
              @if (user.specialties?.length) {
                <div class="mt-3 flex flex-wrap gap-1.5">
                  @for (specialty of user.specialties ?? []; track specialty) {
                    <span class="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-neutral-400">
                      {{ specialty }}
                    </span>
                  }
                </div>
              }
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            @if (isOwnProfile()) {
              <a routerLink="/account/profile" class="btn-secondary px-4 py-2.5 text-xs">
                Editar perfil
              </a>
              <a routerLink="/upload" class="btn-accent px-4 py-2.5 text-xs">Añadir foto</a>
            } @else {
              <button
                type="button"
                class="btn-accent px-4 py-2.5 text-xs"
                (click)="openHire()"
              >
                Contratar
              </button>
              <button
                type="button"
                class="btn-secondary px-4 py-2.5 text-xs"
                [class.border-accent-500]="isFollowing()"
                [class.text-accent-300]="isFollowing()"
                (click)="toggleFollow()"
              >
                {{ isFollowing() ? 'Siguiendo' : 'Seguir' }}
              </button>
              <button
                type="button"
                class="btn-secondary px-4 py-2.5 text-xs"
                [class.border-accent-500]="isFavorite()"
                [class.text-accent-300]="isFavorite()"
                [attr.aria-pressed]="isFavorite()"
                (click)="toggleFavorite()"
              >
                {{ isFavorite() ? '★ Favorito' : '☆ Favorito' }}
              </button>
              <button type="button" class="btn-secondary px-4 py-2.5 text-xs" (click)="share()">
                Compartir
              </button>
            }
          </div>
        </header>

        <div
          class="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-4"
        >
          <article class="bg-ink-900 p-4">
            <p class="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Publicaciones</p>
            <p class="mt-2 font-display text-2xl text-white">{{ photos().length }}</p>
          </article>
          <article class="bg-ink-900 p-4">
            <p class="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Upvotes</p>
            <p class="mt-2 font-display text-2xl text-white">{{ totalUpvotes() }}</p>
          </article>
          <article class="bg-ink-900 p-4">
            <p class="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Seguidores</p>
            <p class="mt-2 font-display text-2xl text-white">{{ followerCount() }}</p>
          </article>
          <article class="bg-ink-900 p-4">
            <p class="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Servicios</p>
            <p class="mt-2 font-display text-2xl text-white">{{ services().length }}</p>
          </article>
        </div>

        <div class="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
          <button type="button" [class]="tabClass('services')" (click)="tab.set('services')">
            Servicios
          </button>
          <button type="button" [class]="tabClass('commercial')" (click)="tab.set('commercial')">
            Portafolio comercial
          </button>
          <button type="button" [class]="tabClass('community')" (click)="tab.set('community')">
            Comunidad
          </button>
          <button type="button" [class]="tabClass('team')" (click)="tab.set('team')">
            Equipo
          </button>
        </div>

        <div class="pt-8">
          @switch (tab()) {
            @case ('services') {
              <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                @for (service of services(); track service.id) {
                  <article class="flex flex-col rounded-2xl border border-ink-800 bg-ink-900 p-5">
                    <h3 class="font-display text-lg font-medium text-white">{{ service.title }}</h3>
                    <p class="mt-2 flex-1 text-sm leading-relaxed text-neutral-400">
                      {{ service.description }}
                    </p>
                    <p class="mt-4 font-display text-xl text-accent-300">
                      USD {{ service.price.toLocaleString('es-PY') }}
                    </p>
                    <div class="mt-1 flex flex-wrap gap-3 text-[11px] text-neutral-500">
                      @if (service.deliverables) {
                        <span>{{ service.deliverables }}</span>
                      }
                      @if (service.turnaround) {
                        <span>· {{ service.turnaround }}</span>
                      }
                    </div>
                    @if (isOwnProfile()) {
                      <a routerLink="/services" class="btn-secondary mt-4 px-4 py-2.5 text-xs">
                        Gestionar servicio
                      </a>
                    } @else {
                      <button
                        type="button"
                        class="btn-accent mt-4 px-4 py-2.5 text-xs"
                        (click)="openHire(service)"
                      >
                        Contratar
                      </button>
                    }
                  </article>
                } @empty {
                  <div class="sm:col-span-2 lg:col-span-3 border-y border-white/10 py-12">
                    <p class="text-sm text-neutral-400">Este fotógrafo aún no publicó servicios.</p>
                    @if (isOwnProfile()) {
                      <a routerLink="/services" class="mt-3 inline-flex text-sm text-accent-300 hover:text-accent-200">
                        Crear mi primer servicio
                      </a>
                    }
                  </div>
                }
              </div>
            }
            @case ('commercial') {
              <div class="columns-1 gap-5 sm:columns-2 lg:columns-3">
                @for (photo of commercialPhotos(); track photo.id) {
                  <div class="mb-6 break-inside-avoid">
                    <app-photo-card
                      [photo]="photo"
                      [hasUpvoted]="hasUpvoted(photo.id)"
                      (onUpvote)="upvote($event)"
                      (onPhotoClick)="selectedPhotoId.set($event)"
                    />
                  </div>
                } @empty {
                  <div class="break-inside-avoid border-y border-white/10 py-12">
                    <p class="text-sm text-neutral-400">Sin trabajos comerciales publicados.</p>
                  </div>
                }
              </div>
            }
            @case ('community') {
              <div class="columns-1 gap-5 sm:columns-2 lg:columns-3">
                @for (photo of communityPhotos(); track photo.id) {
                  <div class="mb-6 break-inside-avoid">
                    <app-photo-card
                      [photo]="photo"
                      [hasUpvoted]="hasUpvoted(photo.id)"
                      (onUpvote)="upvote($event)"
                      (onPhotoClick)="selectedPhotoId.set($event)"
                    />
                  </div>
                } @empty {
                  <div class="break-inside-avoid border-y border-white/10 py-12">
                    <p class="text-sm text-neutral-400">
                      Aún no hay fotos de hobby o feedback en esta galería.
                    </p>
                    @if (isOwnProfile()) {
                      <a routerLink="/upload" class="mt-3 inline-flex text-sm text-accent-300 hover:text-accent-200">
                        Publicar el primer trabajo
                      </a>
                    }
                  </div>
                }
              </div>
            }
            @case ('team') {
              <div class="grid gap-6 md:grid-cols-2">
                <article class="rounded-2xl border border-ink-800 bg-ink-900 p-6">
                  <h2 class="font-display text-lg font-medium text-white">Especialidades</h2>
                  @if (user.specialties?.length) {
                    <ul class="mt-3 space-y-2 text-sm text-neutral-400">
                      @for (specialty of user.specialties ?? []; track specialty) {
                        <li>{{ specialty }}</li>
                      }
                    </ul>
                  } @else {
                    <p class="mt-3 text-sm text-neutral-500">Sin especialidades declaradas.</p>
                  }
                </article>
                <article class="rounded-2xl border border-ink-800 bg-ink-900 p-6">
                  <h2 class="font-display text-lg font-medium text-white">Equipo</h2>
                  @if (user.equipment?.length) {
                    <ul class="mt-3 space-y-2 text-sm text-neutral-400">
                      @for (item of user.equipment ?? []; track item) {
                        <li>{{ item }}</li>
                      }
                    </ul>
                  } @else {
                    <p class="mt-3 text-sm text-neutral-500">Equipo no especificado.</p>
                  }
                </article>
                <article class="rounded-2xl border border-ink-800 bg-ink-900 p-6 md:col-span-2">
                  <h2 class="font-display text-lg font-medium text-white">Contacto</h2>
                  <div class="mt-3 flex flex-wrap gap-2">
                    @for (link of user.links; track link.url) {
                      <a
                        [href]="link.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn-secondary px-4 py-2.5 text-xs"
                      >
                        {{ link.label }}
                      </a>
                    }
                    @if (user.contactEmail) {
                      <a [href]="'mailto:' + user.contactEmail" class="btn-secondary px-4 py-2.5 text-xs">
                        {{ user.contactEmail }}
                      </a>
                    }
                  </div>
                </article>
              </div>
            }
          }
        </div>

        @if (loginWall()) {
          <app-login-wall
            variant="floating"
            message="Inicia sesión para interactuar con este portafolio."
            (onLogin)="loginWall.set(false)"
          />
        }

        @if (selectedPhoto(); as photo) {
          <app-photo-detail-modal [photo]="photo" (onClose)="selectedPhotoId.set(null)" />
        }

        @if (hireService(); as service) {
          <app-hire-modal
            [photographer]="user"
            [service]="service"
            (onClose)="hireService.set(null)"
          />
        } @else {
          @if (hirePhoto(); as photo) {
            <app-hire-modal
              [photographer]="user"
              [photo]="photo"
              (onClose)="hirePhoto.set(null)"
            />
          } @else if (hireOpen()) {
            <app-hire-modal
              [photographer]="user"
              (onClose)="hireOpen.set(false)"
            />
          }
        }
      } @else {
        <div class="mx-auto max-w-xl py-24 text-center">
          <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">ÑanduGrid</p>
          <h1 class="mt-3 font-display text-3xl font-semibold text-white">Portafolio no encontrado</h1>
          <p class="mt-3 text-sm text-neutral-400">
            No existe un fotógrafo con el usuario &#64;{{ username() }}.
          </p>
          <a routerLink="/marketplace" class="btn-accent mt-8">Explorar fotógrafos</a>
        </div>
      }
    </section>
  `,
})
export class PortfolioComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthMockService);
  private readonly users = inject(UserMockService);
  private readonly photoService = inject(PhotoMockService);
  private readonly serviceService = inject(ServiceMockService);
  private readonly social = inject(SocialMockService);
  private readonly toast = inject(ToastService);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly currentUser = this.auth.currentUser;
  readonly username = computed(() => this.paramMap().get('username') ?? '');
  readonly profile = computed(() => this.users.byUsername(this.username()));
  readonly isOwnProfile = computed(() => {
    const profile = this.profile();
    const current = this.currentUser();
    return Boolean(profile && current && profile.id === current.id);
  });
  readonly initials = computed(() =>
    (this.profile()?.displayName ?? '')
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
  );
  readonly photos = computed(() => {
    const profile = this.profile();
    return profile ? this.photoService.getByAuthorId(profile.id) : [];
  });
  readonly commercialPhotos = computed(() =>
    this.photos().filter((photo) => photo.purpose === 'commercial'),
  );
  readonly communityPhotos = computed(() =>
    this.photos().filter((photo) => photo.purpose !== 'commercial'),
  );
  readonly services = computed(() => {
    const profile = this.profile();
    return profile ? this.serviceService.byOwner(profile.id, true) : [];
  });
  readonly totalUpvotes = computed(() =>
    this.photos().reduce((total, photo) => total + photo.upvotes, 0),
  );
  readonly followerCount = computed(() => {
    const profile = this.profile();
    return profile ? this.social.followerIds(profile.id).length : 0;
  });
  readonly isFollowing = computed(() => {
    const profile = this.profile();
    const current = this.currentUser();
    return Boolean(profile && current && this.social.isFollowing(current.id, profile.id));
  });
  readonly isFavorite = computed(() => {
    const profile = this.profile();
    const current = this.currentUser();
    return Boolean(profile && current && this.social.isFavorite(current.id, profile.id));
  });

  readonly tab = signal<PortfolioTab>('services');
  readonly selectedPhotoId = signal<string | null>(null);
  readonly selectedPhoto = computed(
    () => this.photos().find((photo) => photo.id === this.selectedPhotoId()) ?? null,
  );
  readonly loginWall = signal(false);
  readonly hireService = signal<Service | null>(null);
  readonly hirePhoto = signal<Photo | null>(null);
  readonly hireOpen = signal(false);

  tabClass(value: PortfolioTab): string {
    return this.tab() === value
      ? 'chip border-accent-500/40 bg-accent-500/10 text-accent-200'
      : 'chip';
  }

  hasUpvoted(id: string): boolean {
    return this.photoService.hasUpvoted(id);
  }

  upvote(id: string): void {
    if (!this.auth.isAuthenticated()) {
      this.loginWall.set(true);
      return;
    }
    const added = this.photoService.toggleUpvote(id);
    this.toast.show(added ? 'Voto registrado' : 'Voto eliminado', added ? 'success' : 'info');
  }

  toggleFollow(): void {
    const profile = this.profile();
    const current = this.currentUser();
    if (!profile || !current) {
      this.loginWall.set(true);
      return;
    }
    const following = this.social.toggleFollow(current.id, profile.id);
    this.toast.show(
      following ? `Ahora sigues a ${profile.displayName}` : `Dejaste de seguir a ${profile.displayName}`,
      following ? 'success' : 'info',
    );
  }

  toggleFavorite(): void {
    const profile = this.profile();
    const current = this.currentUser();
    if (!profile || !current) {
      this.loginWall.set(true);
      return;
    }
    const favorite = this.social.toggleFavorite(current.id, profile.id);
    this.toast.show(
      favorite ? 'Añadido a favoritos' : 'Eliminado de favoritos',
      favorite ? 'success' : 'info',
    );
  }

  share(): void {
    const url = globalThis.location?.href;
    if (url && navigator.clipboard) {
      void navigator.clipboard
        .writeText(url)
        .then(() => this.toast.show('Enlace copiado al portapapeles'))
        .catch(() => this.toast.show('No se pudo copiar el enlace', 'error'));
      return;
    }
    this.toast.show('No se pudo copiar el enlace', 'error');
  }

  openHire(service?: Service): void {
    if (!this.auth.isAuthenticated()) {
      this.loginWall.set(true);
      return;
    }
    this.hireService.set(service ?? null);
    this.hirePhoto.set(null);
    this.hireOpen.set(!service);
  }
}
