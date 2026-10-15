import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Photo, PhotoPurpose } from '../../core/models/photo.model';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { PhotoMockService } from '../../core/services/photo-mock.service';

interface PurposeOption {
  value: PhotoPurpose;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './upload.component.html',
})
export class UploadComponent {
  private readonly photoService = inject(PhotoMockService);
  private readonly authService = inject(AuthMockService);
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

  readonly purpose = signal<PhotoPurpose | null>(null);
  readonly step = computed(() => (this.purpose() ? 2 : 1));

  readonly previewUrl = signal<string | null>(null);
  readonly isDragging = signal(false);

  readonly title = signal('');
  readonly camera = signal('');
  readonly lens = signal('');
  readonly iso = signal<number | null>(null);
  readonly aperture = signal('');
  readonly shutter = signal('');
  readonly price = signal<number | null>(null);

  readonly canPublish = computed(
    () => this.purpose() !== null && this.previewUrl() !== null && this.title().trim().length > 0,
  );

  selectPurpose(value: PhotoPurpose): void {
    this.purpose.set(value);
  }

  changePurpose(): void {
    this.purpose.set(null);
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

  publish(): void {
    const purpose = this.purpose();
    const url = this.previewUrl();
    if (!purpose || !url || !this.title().trim()) {
      return;
    }

    const iso = this.iso();
    const price = this.price();

    const photo: Photo = {
      id: globalThis.crypto?.randomUUID?.() ?? `ph-${Date.now()}`,
      url,
      purpose,
      upvotes: 0,
      title: this.title().trim(),
      author: this.authService.currentUser()?.displayName ?? 'Tú',
      createdAt: new Date().toISOString(),
      exif: {
        camera: this.camera().trim() || undefined,
        lens: this.lens().trim() || undefined,
        iso: iso ?? undefined,
        aperture: this.aperture().trim() || undefined,
        shutter: this.shutter().trim() || undefined,
      },
      ...(purpose === 'commercial' && price ? { price } : {}),
    };

    this.photoService.addPhoto(photo);
    this.router.navigate(['/']);
  }

  private loadFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
      this.populateSimulatedExif();
    };
    reader.readAsDataURL(file);
  }

  private populateSimulatedExif(): void {
    this.camera.set('Sony A7 IV');
    this.lens.set('FE 24-70mm F2.8 GM II');
    this.iso.set(200);
    this.aperture.set('f/2.8');
    this.shutter.set('1/250');
  }
}
