import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { PhotoMockService } from '../../core/services/photo-mock.service';
import { PhotoDetailModalComponent } from '../../shared/components/photo-detail-modal/photo-detail-modal.component';
import { PhotoCardComponent } from '../../shared/components/photo-card/photo-card.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [RouterLink, PhotoCardComponent, PhotoDetailModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
      <header class="grid gap-8 border-b border-white/10 pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div class="flex items-start gap-5">
          @if (profile(); as user) {
            <img [src]="user.avatarUrl" [alt]="'Foto de ' + author()" class="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-white/15" />
          } @else {
            <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-700 font-display text-2xl text-white ring-1 ring-white/15">
              {{ initials() }}
            </div>
          }
          <div class="min-w-0">
            <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">Portafolio</p>
            <h1 class="mt-2 font-display text-3xl font-semibold text-white">{{ author() }}</h1>
            @if (profile()?.location) {
              <p class="mt-1 text-sm text-neutral-400">{{ profile()?.location }}</p>
            }
            <p class="mt-3 max-w-xl text-sm leading-relaxed text-neutral-400">
              {{ profile()?.bio ?? 'Fotografía independiente en ÑanduGrid.' }}
            </p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          @for (link of profileLinks(); track link.url) {
            <a [href]="link.url" target="_blank" rel="noopener noreferrer" class="btn-secondary px-4 py-2.5 text-xs">
              {{ link.label }}
            </a>
          }
          @if (isOwnProfile()) {
            <a routerLink="/account/profile" class="btn-accent px-4 py-2.5 text-xs">Editar perfil</a>
          }
        </div>
      </header>

      <div class="grid gap-12 pt-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section aria-labelledby="gallery-title">
          <div class="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 id="gallery-title" class="font-display text-xl font-medium text-white">Selección de trabajos</h2>
              <p class="mt-1 text-xs text-neutral-500">{{ photos().length }} publicaciones · {{ totalUpvotes() }} upvotes</p>
            </div>
            @if (isOwnProfile()) {
              <a routerLink="/upload" class="text-sm text-accent-300 hover:text-accent-200">Añadir foto</a>
            }
          </div>
          <div class="columns-1 gap-5 sm:columns-2">
            @for (photo of photos(); track photo.id) {
              <div class="mb-6 break-inside-avoid">
                <app-photo-card
                  [photo]="photo"
                  (onUpvote)="upvote($event)"
                  (onPhotoClick)="selectedPhotoId.set($event)"
                />
              </div>
            } @empty {
              <div class="break-inside-avoid border-y border-white/10 py-12">
                <p class="text-sm text-neutral-400">Aún no hay fotos en esta galería.</p>
                @if (isOwnProfile()) {
                  <a routerLink="/upload" class="mt-3 inline-flex text-sm text-accent-300 hover:text-accent-200">Publicar el primer trabajo</a>
                }
              </div>
            }
          </div>
        </section>

        <aside class="border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <div class="flex items-end justify-between">
            <div>
              <p class="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Contrataciones</p>
              <h2 class="mt-2 font-display text-xl font-medium text-white">Servicios</h2>
            </div>
            <span class="text-xs text-neutral-500">desde USD</span>
          </div>
          <div class="mt-5 divide-y divide-white/10">
            @for (service of services; track service.name) {
              <article class="py-4">
                <div class="flex items-baseline justify-between gap-3">
                  <h3 class="text-sm font-medium text-white">{{ service.name }}</h3>
                  <span class="shrink-0 text-sm text-accent-300">{{ service.price }}</span>
                </div>
                <p class="mt-1 text-xs leading-relaxed text-neutral-500">{{ service.description }}</p>
              </article>
            }
          </div>
          @if (profileLinks().length) {
            <div class="mt-5 border-t border-white/10 pt-5">
              <p class="text-xs leading-relaxed text-neutral-400">¿Tienes un proyecto en mente?</p>
              <a [href]="profileLinks()[0].url" target="_blank" rel="noopener noreferrer" class="btn-accent mt-3 w-full px-4 py-3 text-xs">
                Contactar al fotógrafo
              </a>
            </div>
          }
        </aside>
      </div>

      @if (loginWall()) {
        <div class="fixed inset-x-4 bottom-5 z-40 mx-auto flex max-w-lg items-center justify-between gap-4 rounded-lg border border-accent-500/30 bg-ink-900 p-4 shadow-soft" role="status">
          <p class="text-sm text-neutral-200">Inicia sesión para dar upvotes.</p>
          <button type="button" class="btn-accent shrink-0 px-4 py-2.5 text-xs" (click)="login()">Entrar en modo demo</button>
        </div>
      }

      @if (selectedPhoto(); as photo) {
        <app-photo-detail-modal [photo]="photo" (onClose)="selectedPhotoId.set(null)" />
      }
    </section>
  `,
})
export class PortfolioComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthMockService);
  private readonly photoService = inject(PhotoMockService);

  readonly currentUser = this.auth.currentUser;
  readonly profile = computed(() => this.username === this.auth.demoProfile().username ? this.auth.demoProfile() : null);
  readonly username = this.route.snapshot.paramMap.get('username') ?? 'tu-usuario';
  readonly isOwnProfile = computed(() => this.auth.isAuthenticated() && this.username === this.currentUser()?.username);
  readonly author = computed(() => this.profile()?.displayName ?? this.username);
  readonly initials = computed(() => this.author().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase());
  readonly photos = computed(() => this.photoService.getByAuthor(this.author()));
  readonly totalUpvotes = computed(() => this.photos().reduce((total, photo) => total + photo.upvotes, 0));
  readonly profileLinks = computed(() => this.profile()?.links ?? []);
  readonly selectedPhotoId = signal<string | null>(null);
  readonly selectedPhoto = computed(() => this.photos().find((photo) => photo.id === this.selectedPhotoId()) ?? null);
  readonly loginWall = signal(false);
  readonly services = [
    { name: 'Retrato editorial', description: 'Sesión individual en exteriores o estudio.', price: '$ 120' },
    { name: 'Fotografía de producto', description: 'Imágenes listas para catálogo y redes.', price: '$ 180' },
    { name: 'Cobertura de eventos', description: 'Registro documental de jornadas y celebraciones.', price: '$ 350' },
  ];

  upvote(id: string): void {
    if (!this.auth.isAuthenticated()) {
      this.loginWall.set(true);
      return;
    }
    this.photoService.upvote(id);
  }

  login(): void {
    void this.auth.login();
    this.loginWall.set(false);
  }
}
