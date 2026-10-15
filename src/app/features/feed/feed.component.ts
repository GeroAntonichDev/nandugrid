import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PhotoMockService } from '../../core/services/photo-mock.service';
import { PhotoCardComponent } from '../../shared/components/photo-card/photo-card.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [PhotoCardComponent],
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
          <app-photo-card [photo]="photo" (onUpvote)="upvote($event)" />
        } @empty {
          <p class="py-16 text-center text-sm text-neutral-500">Todavía no hay fotos. ¡Subí la primera!</p>
        }
      </div>
    </section>
  `,
})
export class FeedComponent {
  private readonly photoService = inject(PhotoMockService);

  readonly photos = this.photoService.photos;

  upvote(id: string): void {
    this.photoService.upvote(id);
  }
}
