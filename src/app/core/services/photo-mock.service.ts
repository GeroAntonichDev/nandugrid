import { Injectable, computed, inject, signal } from '@angular/core';
import { Comment } from '../models/comment.model';
import { Photo } from '../models/photo.model';
import { AuthMockService } from './auth-mock.service';

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

const MOCK_COMMENTS: Comment[] = [
  {
    id: 'cm-001',
    photoId: 'ph-001',
    authorName: 'Diego Fernández',
    text: 'Excelente manejo de la luz en el horizonte. ¿Usaste filtro polarizador?',
    createdAt: new Date('2026-10-12T10:15:00.000Z'),
  },
  {
    id: 'cm-002',
    photoId: 'ph-001',
    authorName: 'Lucía Méndez',
    text: 'La composición guía muy bien la mirada. Quizás un poco más de contraste en las sombras.',
    createdAt: new Date('2026-10-12T11:02:00.000Z'),
  },
  {
    id: 'cm-003',
    photoId: 'ph-002',
    authorName: 'Camila Rojas',
    text: 'Ese rayo de luz entre los árboles es mágico. ¡Gran momento capturado!',
    createdAt: new Date('2026-10-13T18:40:00.000Z'),
  },
];

@Injectable({ providedIn: 'root' })
export class PhotoMockService {
  private readonly auth = inject(AuthMockService);

  private readonly _photos = signal<Photo[]>(MOCK_PHOTOS);
  private readonly _comments = signal<Comment[]>(MOCK_COMMENTS);

  readonly photos = this._photos.asReadonly();
  readonly comments = this._comments.asReadonly();
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

  addComment(photoId: string, text: string): void {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    const authorName = this.auth.currentUser()?.displayName ?? 'Tú';
    this._comments.update((comments) => [
      ...comments,
      {
        id: globalThis.crypto?.randomUUID?.() ?? `cm-${Date.now()}`,
        photoId,
        authorName,
        text: trimmed,
        createdAt: new Date(),
      },
    ]);
  }
}
