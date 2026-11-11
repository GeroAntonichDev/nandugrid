import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { Photo, PhotoPurpose } from '../../../core/models/photo.model';
import { PhotoMockService } from '../../../core/services/photo-mock.service';
import { UserMockService } from '../../../core/services/user-mock.service';
import { purposeLabel as resolvePurposeLabel } from '../../../core/utils/photo-purpose';
import { ExifBarComponent } from '../exif-bar/exif-bar.component';
import { WatermarkOverlayComponent } from '../watermark-overlay/watermark-overlay.component';

@Component({
  selector: 'app-photo-card',
  standalone: true,
  imports: [ExifBarComponent, WatermarkOverlayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="group animate-fade-in-up">
      <button
        type="button"
        (click)="onPhotoClick.emit(photo.id)"
        class="relative block w-full cursor-pointer overflow-hidden rounded-3xl border border-white/5 bg-ink-900 shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/60"
        [attr.aria-label]="'Abrir ' + photo.title"
      >
        <img
          [src]="photo.url"
          [alt]="photo.title"
          loading="lazy"
          class="aspect-[4/3] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.02]"
        />
        <span
          class="absolute left-3 top-3 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/70"
        >
          {{ photo.category }}
        </span>
        <app-watermark-overlay [authorUsername]="authorUsername()" />
      </button>

      <div class="mt-4 flex items-center justify-between gap-4">
        <div class="flex min-w-0 items-center gap-3">
          @if (avatarUrl(); as avatar) {
            <img
              [src]="avatar"
              [alt]="'Foto de ' + authorName()"
              class="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/10"
            />
          } @else {
            <div
              class="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-accent-300 to-accent-700 ring-1 ring-white/10"
            ></div>
          }
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-white">{{ photo.title }}</p>
            <p class="truncate text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              {{ authorName() }} · {{ purposeLabel(photo.purpose) }}
            </p>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <span
            class="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs text-neutral-400"
            [attr.aria-label]="commentCount() + ' comentarios'"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z" />
            </svg>
            <span class="tabular-nums">{{ commentCount() }}</span>
          </span>

          <button
            type="button"
            (click)="onUpvote.emit(photo.id)"
            class="flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-sm text-neutral-300 transition hover:border-accent-500/50 hover:text-accent-300 active:scale-95"
            [class.border-accent-500]="hasUpvoted"
            [class.text-accent-300]="hasUpvoted"
            [attr.aria-pressed]="hasUpvoted"
            [attr.aria-label]="(hasUpvoted ? 'Quitar voto de ' : 'Votar por ') + photo.title"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              [attr.fill]="hasUpvoted ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                d="M12 4l2.35 4.76 5.25.76-3.8 3.7.9 5.23L12 15.98l-4.7 2.47.9-5.23-3.8-3.7 5.25-.76L12 4z"
              />
            </svg>
            <span class="tabular-nums">{{ photo.upvotes }}</span>
          </button>
        </div>
      </div>

      <app-exif-bar class="mt-3 block" [exif]="photo.exif" />
    </article>
  `,
})
export class PhotoCardComponent {
  @Input({ required: true }) photo!: Photo;
  @Input() hasUpvoted = false;
  @Output() onUpvote = new EventEmitter<string>();
  @Output() onPhotoClick = new EventEmitter<string>();

  private readonly users = inject(UserMockService);
  private readonly photos = inject(PhotoMockService);

  authorName(): string {
    return this.users.byId(this.photo.authorId)?.displayName ?? 'Fotógrafo';
  }

  authorUsername(): string | undefined {
    return this.users.byId(this.photo.authorId)?.username;
  }

  avatarUrl(): string | undefined {
    return this.users.byId(this.photo.authorId)?.avatarUrl;
  }

  commentCount(): number {
    return this.photos.commentCount(this.photo.id);
  }

  purposeLabel(purpose: PhotoPurpose): string {
    return resolvePurposeLabel(purpose);
  }
}
