import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Photo, PhotoPurpose } from '../../core/models/photo.model';
import { PhotoMockService } from '../../core/services/photo-mock.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-2xl px-4 pb-24 pt-10 sm:px-6">
      <header class="animate-fade-in">
        <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">ÑanduGrid</p>
        <h1 class="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Explorar
        </h1>
        <p class="mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
          Fotografía reciente de la comunidad. Inspírate, deja feedback y descubre nuevos talentos.
        </p>
      </header>

      <div class="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
        <button type="button" class="chip border-accent-500/40 bg-accent-500/10 text-accent-200">
          Todo
        </button>
        <button type="button" class="chip">Hobby</button>
        <button type="button" class="chip">Feedback</button>
        <button type="button" class="chip">Comercial</button>
      </div>

      <div class="mt-8 flex flex-col gap-12">
        @for (photo of photos(); track photo.id) {
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
                  <p class="truncate text-sm font-medium text-white">{{ photo.author }}</p>
                  <p class="truncate text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    {{ purposeLabel(photo.purpose) }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="upvote(photo.id)"
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

            <div
              class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-white/5 bg-ink-900/60 px-4 py-2.5 text-[11px] uppercase tracking-wider text-neutral-500"
            >
              <span class="font-medium normal-case tracking-normal text-neutral-300">
                {{ photo.title }}
              </span>
              @if (photo.exif.iso) {
                <span>ISO {{ photo.exif.iso }}</span>
              }
              @if (photo.exif.aperture) {
                <span>{{ photo.exif.aperture }}</span>
              }
              @if (photo.exif.shutter) {
                <span>{{ photo.exif.shutter }}</span>
              }
              @if (photo.exif.lens) {
                <span class="truncate normal-case tracking-normal text-neutral-400">
                  {{ photo.exif.lens }}
                </span>
              }
            </div>
          </article>
        }
      </div>
    </section>
  `,
})
export class FeedComponent {
  private readonly photoService = inject(PhotoMockService);

  readonly photos = this.photoService.photos;

  private readonly purposeLabels: Record<PhotoPurpose, string> = {
    hobby: 'Hobby',
    feedback: 'Para feedback',
    commercial: 'Portafolio comercial',
  };

  purposeLabel(purpose: PhotoPurpose): string {
    return this.purposeLabels[purpose];
  }

  upvote(id: string): void {
    this.photoService.upvote(id);
  }
}
