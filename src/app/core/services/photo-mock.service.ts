import { Injectable, computed, signal } from '@angular/core';
import { Photo } from '../models/photo.model';

const MOCK_PHOTOS: Photo[] = [
  {
    id: 'ph-001',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
    purpose: 'hobby',
    upvotes: 128,
    title: 'Valle al amanecer',
    author: 'Camila Rojas',
    createdAt: '2026-10-12T09:24:00.000Z',
    exif: {
      camera: 'Sony A7 IV',
      lens: 'FE 24-70mm F2.8 GM II',
      iso: 100,
      aperture: 'f/8',
      shutter: '1/250',
      focalLength: '35mm',
    },
  },
  {
    id: 'ph-002',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80',
    purpose: 'feedback',
    upvotes: 342,
    title: 'Luz entre los árboles',
    author: 'Diego Fernández',
    createdAt: '2026-10-13T16:02:00.000Z',
    exif: {
      camera: 'Canon EOS R6',
      lens: 'RF 50mm F1.2 L USM',
      iso: 400,
      aperture: 'f/1.8',
      shutter: '1/500',
      focalLength: '50mm',
    },
  },
  {
    id: 'ph-003',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80',
    purpose: 'commercial',
    upvotes: 517,
    title: 'Cumbre nocturna',
    author: 'Lucía Méndez',
    createdAt: '2026-10-14T22:41:00.000Z',
    exif: {
      camera: 'Nikon Z8',
      lens: 'NIKKOR Z 14-24mm f/2.8 S',
      iso: 3200,
      aperture: 'f/2.8',
      shutter: '15s',
      focalLength: '14mm',
    },
  },
];

@Injectable({ providedIn: 'root' })
export class PhotoMockService {
  private readonly _photos = signal<Photo[]>(MOCK_PHOTOS);

  readonly photos = this._photos.asReadonly();
  readonly total = computed(() => this._photos().length);

  getPhotos(): Promise<Photo[]> {
    return Promise.resolve(this._photos());
  }

  getByAuthor(author: string): Photo[] {
    return this._photos().filter((photo) => photo.author === author);
  }

  upvote(id: string): void {
    this._photos.update((photos) =>
      photos.map((photo) => (photo.id === id ? { ...photo, upvotes: photo.upvotes + 1 } : photo)),
    );
  }

  addPhoto(photo: Photo): void {
    this._photos.update((photos) => [photo, ...photos]);
  }
}
