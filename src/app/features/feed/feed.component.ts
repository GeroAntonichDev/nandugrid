import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PhotoPurpose } from '../../core/models/photo.model';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { PhotoMockService } from '../../core/services/photo-mock.service';
import { ToastService } from '../../core/services/toast.service';
import { LoginWallComponent } from '../../shared/components/login-wall/login-wall.component';
import { PhotoCardComponent } from '../../shared/components/photo-card/photo-card.component';
import { PhotoDetailModalComponent } from '../../shared/components/photo-detail-modal/photo-detail-modal.component';

type FeedPurposeFilter = 'all' | Exclude<PhotoPurpose, 'commercial'>;

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [PhotoCardComponent, PhotoDetailModalComponent, LoginWallComponent],
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
        <button type="button" [class]="purposeChip('all')" (click)="purposeFilter.set('all')">
          Todo
        </button>
        <button type="button" [class]="purposeChip('hobby')" (click)="purposeFilter.set('hobby')">
          Hobby
        </button>
        <button type="button" [class]="purposeChip('feedback')" (click)="purposeFilter.set('feedback')">
          Feedback
        </button>
      </div>

      <div class="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
        <button type="button" [class]="categoryChip(null)" (click)="categoryFilter.set(null)">
          Todas las categorías
        </button>
        @for (category of categories(); track category) {
          <button type="button" [class]="categoryChip(category)" (click)="categoryFilter.set(category)">
            {{ category }}
          </button>
        }
      </div>

      @if (loginWall()) {
        <app-login-wall class="mt-5 block" (onLogin)="loginWall.set(false)" />
      }

      <div class="mt-8 flex flex-col gap-12">
        @for (photo of photos(); track photo.id) {
          <app-photo-card
            [photo]="photo"
            [hasUpvoted]="hasUpvoted(photo.id)"
            (onUpvote)="upvote($event)"
            (onPhotoClick)="openPhoto($event)"
          />
        } @empty {
          <div class="border-y border-white/10 py-16 text-center">
            <p class="text-sm text-neutral-400">
              No hay fotos con estos filtros.
            </p>
            <button
              type="button"
              class="mt-3 text-sm text-accent-300 hover:text-accent-200"
              (click)="resetFilters()"
            >
              Limpiar filtros
            </button>
          </div>
        }
      </div>

      @if (selectedPhoto(); as photo) {
        <app-photo-detail-modal [photo]="photo" (onClose)="closePhoto()" />
      }
    </section>
  `,
})
export class FeedComponent {
  private readonly photoService = inject(PhotoMockService);
  private readonly auth = inject(AuthMockService);
  private readonly toast = inject(ToastService);

  readonly purposeFilter = signal<FeedPurposeFilter>('all');
  readonly categoryFilter = signal<string | null>(null);
  readonly categories = computed(() =>
    [...new Set(this.photoService.feedPhotos().map((photo) => photo.category))].sort((a, b) =>
      a.localeCompare(b),
    ),
  );
  readonly photos = computed(() => {
    const purpose = this.purposeFilter();
    const category = this.categoryFilter();
    return this.photoService
      .feedPhotos()
      .filter((photo) => purpose === 'all' || photo.purpose === purpose)
      .filter((photo) => !category || photo.category === category);
  });
  readonly loginWall = signal(false);
  readonly selectedPhotoId = signal<string | null>(null);
  readonly selectedPhoto = computed(
    () => this.photos().find((photo) => photo.id === this.selectedPhotoId()) ?? null,
  );

  purposeChip(value: FeedPurposeFilter): string {
    return this.purposeFilter() === value
      ? 'chip border-accent-500/40 bg-accent-500/10 text-accent-200'
      : 'chip';
  }

  categoryChip(value: string | null): string {
    return this.categoryFilter() === value
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

  resetFilters(): void {
    this.purposeFilter.set('all');
    this.categoryFilter.set(null);
  }

  openPhoto(id: string): void {
    this.selectedPhotoId.set(id);
  }

  closePhoto(): void {
    this.selectedPhotoId.set(null);
  }
}
