import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Photo, PhotoPurpose } from '../../core/models/photo.model';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { PhotoMockService } from '../../core/services/photo-mock.service';
import { ToastService } from '../../core/services/toast.service';
import { PHOTO_CATEGORIES } from '../../core/utils/photo-categories';
import { WatermarkOverlayComponent } from '../../shared/components/watermark-overlay/watermark-overlay.component';

interface PurposeOption {
  value: PhotoPurpose;
  title: string;
  description: string;
  icon: string;
}

const DRIVE_SAMPLES = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
];

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [WatermarkOverlayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './upload.component.html',
})
export class UploadComponent {
  private readonly photoService = inject(PhotoMockService);
  private readonly authService = inject(AuthMockService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly purposes: PurposeOption[] = [
    {
      value: 'hobby',
      title: 'Hobby / Exploración',
      description: 'Comparte tu arte con la comunidad sin presiones.',
      icon: 'M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16 10.1 11.4 5.5 9.5 10.1 7.6 12 3z',
    },
    {
      value: 'feedback',
      title: 'Feedback Técnico',
      description:
        'Solicita críticas constructivas sobre tu composición, luz o edición (Muestra datos EXIF).',
      icon: 'M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z',
    },
    {
      value: 'commercial',
      title: 'Portafolio Comercial',
      description: 'Promociona tu trabajo para contrataciones o venta de servicios.',
      icon: 'M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 3 12.2V5a2 2 0 0 1 2-2h7.2a2 2 0 0 1 1.4.6l7 7a2 2 0 0 1 0 2.8z',
    },
  ];

  readonly categories = PHOTO_CATEGORIES;
  readonly purpose = signal<PhotoPurpose | null>(null);
  readonly step = computed(() => (this.purpose() ? 2 : 1));

  readonly previewUrl = signal<string | null>(null);
  readonly isDragging = signal(false);
  readonly showWatermark = signal(true);
  readonly authorUsername = computed(() => this.authService.currentUser()?.username);

  readonly title = signal('');
  readonly category = signal('');
  readonly description = signal('');
  readonly tagsInput = signal('');
  readonly camera = signal('');
  readonly lens = signal('');
  readonly iso = signal<number | null>(null);
  readonly aperture = signal('');
  readonly shutter = signal('');
  readonly focalLength = signal('');
  readonly price = signal<number | null>(null);

  readonly tags = computed(() =>
    this.tagsInput()
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag.length > 0),
  );

  readonly canPublish = computed(() => {
    const purpose = this.purpose();
    if (!purpose || !this.previewUrl() || !this.title().trim() || !this.category()) {
      return false;
    }
    if (purpose === 'feedback' && !this.camera().trim()) {
      return false;
    }
    const price = this.price();
    if (purpose === 'commercial' && (!price || price <= 0)) {
      return false;
    }
    return true;
  });

  selectPurpose(value: PhotoPurpose): void {
    this.purpose.set(value);
    if (this.previewUrl() && value === 'feedback') {
      this.populateSimulatedExif();
    }
  }

  changePurpose(): void {
    this.purpose.set(null);
    this.resetDetails();
  }

  onFileInput(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.loadFile(file);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.loadFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  clearImage(): void {
    this.previewUrl.set(null);
  }

  importFromDrive(): void {
    const sample = DRIVE_SAMPLES[Math.floor(Math.random() * DRIVE_SAMPLES.length)];
    this.previewUrl.set(sample);
    this.showWatermark.set(true);
    if (!this.title().trim()) {
      this.title.set('Imagen importada de Drive');
    }
    if (this.purpose() === 'feedback') {
      this.populateSimulatedExif();
    }
    this.toast.show('Imagen importada desde Google Drive (demo)', 'info');
  }

  publish(): void {
    const purpose = this.purpose();
    const url = this.previewUrl();
    const title = this.title().trim();
    const category = this.category();
    const user = this.authService.currentUser();
    if (!purpose || !url || !title || !category || !user) {
      return;
    }
    if (purpose === 'feedback' && !this.camera().trim()) {
      return;
    }
    const price = this.price();
    if (purpose === 'commercial' && (!price || price <= 0)) {
      return;
    }

    const iso = this.iso();
    const description = this.description().trim();

    const photo: Photo = {
      id: globalThis.crypto?.randomUUID?.() ?? `ph-${Date.now()}`,
      url,
      purpose,
      upvotes: 0,
      title,
      authorId: user.id,
      category,
      tags: this.tags(),
      createdAt: new Date().toISOString(),
      ...(description ? { description } : {}),
      exif:
        purpose === 'feedback'
          ? {
              camera: this.camera().trim() || undefined,
              lens: this.lens().trim() || undefined,
              iso: iso ?? undefined,
              aperture: this.aperture().trim() || undefined,
              shutter: this.shutter().trim() || undefined,
              focalLength: this.focalLength().trim() || undefined,
            }
          : {},
      ...(purpose === 'commercial' && price ? { price } : {}),
    };

    this.photoService.addPhoto(photo);
    this.toast.show('Foto publicada');

    if (purpose === 'commercial') {
      this.router.navigate(['/u', user.username]);
      return;
    }
    this.router.navigate(['/']);
  }

  private loadFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
      if (this.purpose() === 'feedback') {
        this.populateSimulatedExif();
      }
    };
    reader.readAsDataURL(file);
  }

  private resetDetails(): void {
    this.category.set('');
    this.description.set('');
    this.tagsInput.set('');
    this.camera.set('');
    this.lens.set('');
    this.iso.set(null);
    this.aperture.set('');
    this.shutter.set('');
    this.focalLength.set('');
    this.price.set(null);
    this.showWatermark.set(true);
  }

  private populateSimulatedExif(): void {
    this.camera.set('Sony A7 IV');
    this.lens.set('FE 24-70mm F2.8 GM II');
    this.iso.set(200);
    this.aperture.set('f/2.8');
    this.shutter.set('1/250');
    this.focalLength.set('35mm');
  }
}
