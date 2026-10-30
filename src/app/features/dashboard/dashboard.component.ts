import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { PhotoMockService } from '../../core/services/photo-mock.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isAuthenticated()) {
      <section class="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
        <header class="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">Espacio privado</p>
            <h1 class="mt-2 font-display text-3xl font-semibold text-white">Panel del fotógrafo</h1>
            <p class="mt-2 text-sm text-neutral-400">Hola, {{ currentUser()?.displayName }}. Así va tu trabajo en ÑanduGrid.</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a routerLink="/account/profile" class="btn-secondary px-4 py-3">Editar perfil</a>
            <a routerLink="/upload" class="btn-accent px-5 py-3">Publicar una foto</a>
          </div>
        </header>

        <div class="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-3">
          <article class="bg-ink-900 p-5">
            <p class="text-xs uppercase tracking-[0.16em] text-neutral-500">Publicaciones</p>
            <p class="mt-3 font-display text-3xl text-white">{{ photos().length }}</p>
          </article>
          <article class="bg-ink-900 p-5">
            <p class="text-xs uppercase tracking-[0.16em] text-neutral-500">Upvotes recibidos</p>
            <p class="mt-3 font-display text-3xl text-white">{{ totalUpvotes() }}</p>
          </article>
          <article class="bg-ink-900 p-5">
            <p class="text-xs uppercase tracking-[0.16em] text-neutral-500">Comentarios</p>
            <p class="mt-3 font-display text-3xl text-white">{{ totalComments() }}</p>
          </article>
        </div>

        <section class="mt-10" aria-labelledby="publications-title">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 id="publications-title" class="font-display text-xl font-medium text-white">Tus publicaciones</h2>
            <a [routerLink]="['/u', currentUser()?.username]" class="text-sm text-accent-300 hover:text-accent-200">Ver portafolio</a>
          </div>
          <div class="divide-y divide-white/10">
            @for (photo of photos(); track photo.id) {
              <article class="flex items-center gap-4 py-4">
                <img [src]="photo.url" [alt]="photo.title" class="h-16 w-20 shrink-0 rounded-md object-cover" />
                <div class="min-w-0 flex-1">
                  <h3 class="truncate text-sm font-medium text-white">{{ photo.title }}</h3>
                  <p class="mt-1 text-xs text-neutral-500">{{ photo.upvotes }} upvotes · {{ photo.purpose }}</p>
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
                <a routerLink="/upload" class="mt-4 inline-flex text-sm text-accent-300 hover:text-accent-200">Subir tu primera foto</a>
              </div>
            }
          </div>
        </section>
      </section>
    } @else {
      <section class="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">Acceso privado</p>
        <h1 class="mt-3 font-display text-3xl font-semibold text-white">Inicia sesión para ver tu panel</h1>
        <p class="mt-3 text-sm text-neutral-400">Las métricas y publicaciones de tu cuenta solo son visibles para ti.</p>
        <button type="button" class="btn-accent mt-8" (click)="login()">Entrar en modo demostración</button>
      </section>
    }
  `,
})
export class DashboardComponent {
  private readonly auth = inject(AuthMockService);
  private readonly photoService = inject(PhotoMockService);

  readonly currentUser = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly photos = computed(() => {
    const author = this.currentUser()?.displayName;
    return author ? this.photoService.getByAuthor(author) : [];
  });
  readonly totalUpvotes = computed(() => this.photos().reduce((total, photo) => total + photo.upvotes, 0));
  readonly totalComments = computed(() => {
    const photoIds = new Set(this.photos().map((photo) => photo.id));
    return this.photoService.comments().filter((comment) => photoIds.has(comment.photoId)).length;
  });

  removePhoto(id: string): void {
    this.photoService.removePhoto(id);
  }

  login(): void {
    void this.auth.login();
  }
}
