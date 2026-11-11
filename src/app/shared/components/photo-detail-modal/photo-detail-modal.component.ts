import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Photo, PhotoPurpose } from '../../../core/models/photo.model';
import { User } from '../../../core/models/user.model';
import { PhotoMockService } from '../../../core/services/photo-mock.service';
import { AuthMockService } from '../../../core/services/auth-mock.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserMockService } from '../../../core/services/user-mock.service';
import { CRITIQUE_TAGS } from '../../../core/utils/critique-tags';
import { purposeLabel as resolvePurposeLabel } from '../../../core/utils/photo-purpose';
import { ExifBarComponent } from '../exif-bar/exif-bar.component';
import { HireModalComponent } from '../hire-modal/hire-modal.component';
import { LoginWallComponent } from '../login-wall/login-wall.component';
import { WatermarkOverlayComponent } from '../watermark-overlay/watermark-overlay.component';

@Component({
  selector: 'app-photo-detail-modal',
  standalone: true,
  imports: [ExifBarComponent, WatermarkOverlayComponent, LoginWallComponent, HireModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex bg-ink-950/95 backdrop-blur-md" (click)="onClose.emit()">
      <div
        class="relative m-auto flex h-full w-full max-w-6xl flex-col overflow-hidden bg-ink-900 lg:h-[90vh] lg:rounded-3xl lg:border lg:border-ink-800"
        (click)="$event.stopPropagation()"
      >
        <button
          type="button"
          (click)="onClose.emit()"
          class="btn-icon absolute right-3 top-3 z-10 bg-ink-950/60 backdrop-blur"
          aria-label="Cerrar"
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

        <div class="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div class="relative flex min-h-0 items-center justify-center bg-ink-950/60 p-4">
            <img
              [src]="photo.url"
              [alt]="photo.title"
              class="max-h-[45vh] w-full rounded-2xl object-contain lg:max-h-full"
            />
            <app-watermark-overlay
              [visible]="showWatermark()"
              [authorUsername]="authorUsername"
            />
            <button
              type="button"
              class="absolute bottom-4 left-4 z-10 rounded-full border border-white/15 bg-ink-950/70 px-3 py-1.5 text-[11px] text-neutral-200 backdrop-blur transition hover:border-accent-500/50 hover:text-white"
              (click)="showWatermark.set(!showWatermark())"
            >
              Marca de agua: {{ showWatermark() ? 'visible' : 'oculta' }}
            </button>
          </div>

          <div class="flex min-h-0 flex-col border-t border-ink-800 lg:border-l lg:border-t-0">
            <div class="border-b border-ink-800 p-5">
              <div class="flex items-center gap-3">
                @if (authorAvatar; as avatar) {
                  <img
                    [src]="avatar"
                    [alt]="'Foto de ' + authorName"
                    class="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                  />
                } @else {
                  <div
                    class="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-accent-300 to-accent-700 ring-1 ring-white/10"
                  ></div>
                }
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-white">{{ authorName }}</p>
                  <p class="truncate text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    {{ purposeLabel(photo.purpose) }} · {{ photo.category }}
                  </p>
                </div>
              </div>
              <h2 class="mt-4 font-display text-xl font-semibold text-white">{{ photo.title }}</h2>

              @if (photo.description) {
                <p class="mt-2 text-sm leading-relaxed text-neutral-400">{{ photo.description }}</p>
              }

              @if (photo.tags.length) {
                <div class="mt-3 flex flex-wrap gap-1.5">
                  @for (tag of photo.tags; track tag) {
                    <span class="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-neutral-400">
                      #{{ tag }}
                    </span>
                  }
                </div>
              }

              @if (isCommercial) {
                <div class="mt-3 rounded-2xl border border-accent-500/30 bg-accent-500/10 p-4">
                  <p class="text-[11px] uppercase tracking-[0.18em] text-accent-400">
                    Servicio de fotografía
                  </p>
                  @if (photo.price) {
                    <p class="mt-1 text-lg font-semibold text-white">
                      Desde USD {{ photo.price.toLocaleString('es-PY') }}
                    </p>
                  }
                  <button
                    type="button"
                    class="btn-accent mt-3 w-full"
                    [disabled]="!isAuthenticated()"
                    (click)="openHire()"
                  >
                    Contactar / Contratar
                  </button>
                  @if (!isAuthenticated()) {
                    <p class="mt-2 text-[11px] leading-relaxed text-neutral-400">
                      Inicia sesión para enviar una solicitud.
                    </p>
                  }
                </div>
              } @else if (photo.price) {
                <p class="mt-1 text-sm text-accent-300">
                  Servicio desde USD {{ photo.price.toLocaleString('es-PY') }}
                </p>
              }

              <app-exif-bar class="mt-3 block" [exif]="photo.exif" />
            </div>

            @if (isCommercial) {
              <div class="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <svg
                  class="h-7 w-7 text-neutral-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <rect x="4" y="11" width="16" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <p class="mt-3 text-sm leading-relaxed text-neutral-400">
                  La crítica técnica está desactivada en las fotos de portafolio comercial.
                </p>
                <p class="mt-1 text-[11px] text-neutral-600">
                  Contactá al fotógrafo para contratar sus servicios.
                </p>
              </div>
            } @else if (isAuthenticated()) {
              <div class="flex items-center justify-between px-5 pt-4">
                <h3 class="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                  Comentarios
                </h3>
                <span class="text-[11px] text-neutral-600">{{ comments().length }}</span>
              </div>

              <div class="flex-1 overflow-y-auto px-5 py-2">
                @for (comment of comments(); track comment.id) {
                  <div class="flex gap-3 py-3">
                    <div
                      class="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-accent-300 to-accent-700 ring-1 ring-white/10"
                    ></div>
                    <div class="min-w-0">
                      <p class="text-sm">
                        <span class="font-medium text-white">{{ commentAuthor(comment.authorId) }}</span>
                        <span class="ml-1 text-[11px] text-neutral-600">{{
                          timeAgo(comment.createdAt)
                        }}</span>
                      </p>
                      <p class="mt-1 text-sm leading-relaxed text-neutral-300">
                        {{ comment.text }}
                      </p>
                      @if (comment.tags?.length) {
                        <div class="mt-1.5 flex flex-wrap gap-1">
                          @for (tag of comment.tags ?? []; track tag) {
                            <span class="rounded-full border border-accent-500/30 bg-accent-500/10 px-2 py-0.5 text-[10px] text-accent-200">
                              {{ tag }}
                            </span>
                          }
                        </div>
                      }
                    </div>
                  </div>
                } @empty {
                  <p class="py-8 text-center text-sm text-neutral-500">
                    Sé el primero en comentar.
                  </p>
                }
              </div>

              <div class="border-t border-ink-800 p-4">
                <div class="mb-2 flex flex-wrap gap-1.5">
                  @for (tag of critiqueTags; track tag) {
                    <button type="button" (click)="toggleTag(tag)" [class]="tagClass(tag)">
                      {{ tag }}
                    </button>
                  }
                </div>
                <div class="flex items-end gap-2">
                  <textarea
                    rows="1"
                    placeholder="Escribí un comentario técnico..."
                    [value]="draft()"
                    (input)="draft.set($any($event.target).value)"
                    (keydown.enter)="onEnter($event)"
                    class="input resize-none"
                  ></textarea>
                  <button
                    type="button"
                    class="btn-accent px-4 py-2.5"
                    [disabled]="!draft().trim()"
                    (click)="submit()"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            } @else {
              <app-login-wall
                class="flex flex-1"
                variant="panel"
                title="Únete a la conversación"
                message="Inicia sesión para ver los comentarios y compartir tu opinión."
                actionLabel="Entrar en modo demostración"
              />
            }
          </div>
        </div>
      </div>
    </div>

    @if (showHire()) {
      @if (author; as photographer) {
        <app-hire-modal
          [photographer]="photographer"
          [photo]="photo"
          (onClose)="showHire.set(false)"
        />
      }
    }
  `,
})
export class PhotoDetailModalComponent {
  @Input({ required: true }) photo!: Photo;
  @Output() onClose = new EventEmitter<void>();

  private readonly photoService = inject(PhotoMockService);
  private readonly auth = inject(AuthMockService);
  private readonly users = inject(UserMockService);
  private readonly toast = inject(ToastService);

  readonly draft = signal('');
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly showHire = signal(false);
  readonly showWatermark = signal(true);
  readonly selectedTags = signal<string[]>([]);
  readonly critiqueTags = CRITIQUE_TAGS;
  readonly comments = computed(() =>
    this.photoService.comments().filter((comment) => comment.photoId === this.photo.id),
  );

  constructor() {
    effect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    });
  }

  get isCommercial(): boolean {
    return this.photo.purpose === 'commercial';
  }

  get author(): User | undefined {
    return this.users.byId(this.photo.authorId);
  }

  get authorName(): string {
    return this.author?.displayName ?? 'Fotógrafo';
  }

  get authorUsername(): string | undefined {
    return this.author?.username;
  }

  get authorAvatar(): string | undefined {
    return this.author?.avatarUrl;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showHire()) {
      this.showHire.set(false);
      return;
    }
    this.onClose.emit();
  }

  purposeLabel(purpose: PhotoPurpose): string {
    return resolvePurposeLabel(purpose);
  }

  commentAuthor(authorId: string): string {
    return this.users.byId(authorId)?.displayName ?? 'Fotógrafo';
  }

  timeAgo(isoDate: string): string {
    const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
    if (seconds < 60) {
      return 'ahora';
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `hace ${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `hace ${hours} h`;
    }
    const days = Math.floor(hours / 24);
    return `hace ${days} d`;
  }

  onEnter(event: Event): void {
    const keyboard = event as KeyboardEvent;
    if (keyboard.shiftKey) {
      return;
    }
    keyboard.preventDefault();
    this.submit();
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  tagClass(tag: string): string {
    const base = 'rounded-full border px-2.5 py-1 text-[11px] transition';
    return this.isTagSelected(tag)
      ? `${base} border-accent-500 text-accent-300`
      : `${base} border-white/10 text-neutral-400`;
  }

  toggleTag(tag: string): void {
    this.selectedTags.update((tags) =>
      tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag],
    );
  }

  submit(): void {
    if (!this.auth.isAuthenticated()) {
      return;
    }
    const text = this.draft().trim();
    if (!text) {
      return;
    }
    const added = this.photoService.addComment(this.photo.id, text, this.selectedTags());
    if (!added) {
      this.toast.show('No se pudo publicar el comentario.', 'error');
      return;
    }
    this.toast.show('Comentario publicado');
    this.draft.set('');
    this.selectedTags.set([]);
  }

  openHire(): void {
    if (!this.auth.isAuthenticated()) {
      this.toast.show('Inicia sesión para contratar.', 'info');
      return;
    }
    this.showHire.set(true);
  }
}
