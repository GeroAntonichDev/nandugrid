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
import { PhotoMockService } from '../../../core/services/photo-mock.service';
import { ExifBarComponent } from '../exif-bar/exif-bar.component';

@Component({
  selector: 'app-photo-detail-modal',
  standalone: true,
  imports: [ExifBarComponent],
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
          <div class="flex min-h-0 items-center justify-center bg-ink-950/60 p-4">
            <img
              [src]="photo.url"
              [alt]="photo.title"
              class="max-h-[45vh] w-full rounded-2xl object-contain lg:max-h-full"
            />
          </div>

          <div class="flex min-h-0 flex-col border-t border-ink-800 lg:border-l lg:border-t-0">
            <div class="border-b border-ink-800 p-5">
              <div class="flex items-center gap-3">
                <div
                  class="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-accent-300 to-accent-700 ring-1 ring-white/10"
                ></div>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-white">{{ photo.author }}</p>
                  <p class="truncate text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    {{ purposeLabel(photo.purpose) }}
                  </p>
                </div>
              </div>
              <h2 class="mt-4 font-display text-xl font-semibold text-white">{{ photo.title }}</h2>
              @if (photo.price) {
                <p class="mt-1 text-sm text-accent-300">
                  Servicio desde $ {{ photo.price.toLocaleString('es-PY') }}
                </p>
              }
              <app-exif-bar class="mt-3 block" [exif]="photo.exif" />
            </div>

            <div class="flex items-center justify-between px-5 pt-4">
              <h3 class="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Comentarios</h3>
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
                      <span class="font-medium text-white">{{ comment.authorName }}</span>
                      <span class="ml-1 text-[11px] text-neutral-600">{{ timeAgo(comment.createdAt) }}</span>
                    </p>
                    <p class="mt-1 text-sm leading-relaxed text-neutral-300">{{ comment.text }}</p>
                  </div>
                </div>
              } @empty {
                <p class="py-8 text-center text-sm text-neutral-500">Sé el primero en comentar.</p>
              }
            </div>

            <div class="border-t border-ink-800 p-4">
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
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PhotoDetailModalComponent {
  @Input({ required: true }) photo!: Photo;
  @Output() onClose = new EventEmitter<void>();

  private readonly photoService = inject(PhotoMockService);

  readonly draft = signal('');
  readonly comments = computed(() =>
    this.photoService.comments().filter((comment) => comment.photoId === this.photo.id),
  );

  private readonly purposeLabels: Record<PhotoPurpose, string> = {
    hobby: 'Hobby',
    feedback: 'Para feedback',
    commercial: 'Portafolio comercial',
  };

  constructor() {
    effect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.onClose.emit();
  }

  purposeLabel(purpose: PhotoPurpose): string {
    return this.purposeLabels[purpose];
  }

  timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
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

  submit(): void {
    const text = this.draft().trim();
    if (!text) {
      return;
    }
    this.photoService.addComment(this.photo.id, text);
    this.draft.set('');
  }
}
