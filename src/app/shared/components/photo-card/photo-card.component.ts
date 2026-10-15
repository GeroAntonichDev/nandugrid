import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Photo, PhotoPurpose } from '../../../core/models/photo.model';
import { ExifBarComponent } from '../exif-bar/exif-bar.component';

@Component({
  selector: 'app-photo-card',
  standalone: true,
  imports: [ExifBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="group animate-fade-in-up">
      <div class="overflow-hidden rounded-3xl border border-white/5 bg-ink-900 shadow-soft">
        <img
          [src]="photo.url"
          [alt]="photo.title"
          loading="lazy"
          class="aspect-[4/3] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.02]"
        />
      </div>

      <div class="mt-4 flex items-center justify-between gap-4">
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-accent-300 to-accent-700 ring-1 ring-white/10"
          ></div>
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-white">{{ photo.title }}</p>
            <p class="truncate text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              {{ photo.author }} · {{ purposeLabel(photo.purpose) }}
            </p>
          </div>
        </div>

        <button
          type="button"
          (click)="onUpvote.emit(photo.id)"
          class="flex shrink-0 items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 text-sm text-neutral-300 transition hover:border-accent-500/50 hover:text-accent-300 active:scale-95"
          [attr.aria-label]="'Votar por ' + photo.title"
        >
          <svg
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
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

      <app-exif-bar class="mt-3 block" [exif]="photo.exif" />
    </article>
  `,
})
export class PhotoCardComponent {
  @Input({ required: true }) photo!: Photo;
  @Output() onUpvote = new EventEmitter<string>();

  private readonly purposeLabels: Record<PhotoPurpose, string> = {
    hobby: 'Hobby',
    feedback: 'Para feedback',
    commercial: 'Portafolio comercial',
  };

  purposeLabel(purpose: PhotoPurpose): string {
    return this.purposeLabels[purpose];
  }
}
