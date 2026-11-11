import { Injectable, computed, inject, signal } from '@angular/core';
import { Comment } from '../models/comment.model';
import { Photo } from '../models/photo.model';
import { AuthMockService } from './auth-mock.service';
import { StorageService } from './storage.service';

const MOCK_PHOTOS: Photo[] = [
  {
    id: 'ph-001',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
    purpose: 'hobby',
    category: 'Paisaje',
    description: 'Primera luz sobre el valle, tomada durante una salida de fin de semana.',
    tags: ['amanecer', 'cordillera', 'luz natural'],
    upvotes: 128,
    title: 'Valle al amanecer',
    authorId: 'usr-002',
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
    category: 'Naturaleza',
    description: 'Buscando cómo renderizar la luz que atraviesa el bosque.',
    tags: ['bosque', 'contraluz'],
    upvotes: 342,
    title: 'Luz entre los árboles',
    authorId: 'usr-003',
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
    category: 'Nocturna',
    description: 'Cumbre nevada bajo un cielo profundo. Disponible para licencias.',
    tags: ['montaña', 'noche', 'larga exposición'],
    upvotes: 517,
    title: 'Cumbre nocturna',
    authorId: 'usr-004',
    createdAt: '2026-10-14T22:41:00.000Z',
    price: 250,
    exif: {
      camera: 'Nikon Z8',
      lens: 'NIKKOR Z 14-24mm f/2.8 S',
      iso: 3200,
      aperture: 'f/2.8',
      shutter: '15s',
      focalLength: '14mm',
    },
  },
  {
    id: 'ph-004',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1400&q=80',
    purpose: 'hobby',
    category: 'Retrato',
    description: 'Retrato de tarde con luz natural y fondo limpio.',
    tags: ['retrato', 'luz natural'],
    upvotes: 64,
    title: 'Mirada de tarde',
    authorId: 'usr-001',
    createdAt: '2026-10-15T17:10:00.000Z',
    exif: {
      camera: 'Sony A7 IV',
      lens: 'FE 24-70mm F2.8 GM II',
      iso: 200,
      aperture: 'f/2.8',
      shutter: '1/320',
      focalLength: '70mm',
    },
  },
  {
    id: 'ph-005',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1400&q=80',
    purpose: 'feedback',
    category: 'Paisaje',
    description: 'Neblina en la ruta. Me interesa la crítica sobre el contraste.',
    tags: ['niebla', 'ruta'],
    upvotes: 210,
    title: 'Camino de niebla',
    authorId: 'usr-002',
    createdAt: '2026-10-16T07:45:00.000Z',
    exif: {
      camera: 'Sony A7 IV',
      lens: 'FE 16-35mm F2.8 GM',
      iso: 160,
      aperture: 'f/5.6',
      shutter: '1/160',
      focalLength: '24mm',
    },
  },
];

const MOCK_COMMENTS: Comment[] = [
  {
    id: 'cm-001',
    photoId: 'ph-001',
    authorId: 'usr-003',
    text: 'Excelente manejo de la luz en el horizonte. ¿Usaste filtro polarizador?',
    tags: ['Iluminación', 'Composición'],
    createdAt: '2026-10-12T10:15:00.000Z',
  },
  {
    id: 'cm-002',
    photoId: 'ph-001',
    authorId: 'usr-004',
    text: 'La composición guía muy bien la mirada. Quizás un poco más de contraste en las sombras.',
    tags: ['Composición', 'Edición'],
    createdAt: '2026-10-12T11:02:00.000Z',
  },
  {
    id: 'cm-003',
    photoId: 'ph-002',
    authorId: 'usr-002',
    text: 'Ese rayo de luz entre los árboles es mágico. ¡Gran momento capturado!',
    tags: ['Iluminación', 'Concepto'],
    createdAt: '2026-10-13T18:40:00.000Z',
  },
];

@Injectable({ providedIn: 'root' })
export class PhotoMockService {
  private readonly auth = inject(AuthMockService);
  private readonly storage = inject(StorageService);

  private readonly _photos = signal<Photo[]>(this.storage.read('photos', MOCK_PHOTOS));
  private readonly _comments = signal<Comment[]>(this.storage.read('comments', MOCK_COMMENTS));
  private readonly _votes = signal<Record<string, string[]>>(this.storage.read('votes', {}));

  readonly photos = this._photos.asReadonly();
  readonly comments = this._comments.asReadonly();
  readonly votes = this._votes.asReadonly();

  readonly feedPhotos = computed(() =>
    this._photos()
      .filter((photo) => photo.purpose !== 'commercial')
      .sort((a, b) => b.upvotes - a.upvotes),
  );

  readonly categories = computed(() =>
    [...new Set(this._photos().map((photo) => photo.category))].sort((a, b) => a.localeCompare(b)),
  );

  getByAuthorId(authorId: string): Photo[] {
    return this._photos().filter((photo) => photo.authorId === authorId);
  }

  commentCount(photoId: string): number {
    return this._comments().filter((comment) => comment.photoId === photoId).length;
  }

  hasUpvoted(photoId: string): boolean {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      return false;
    }
    return (this._votes()[userId] ?? []).includes(photoId);
  }

  toggleUpvote(photoId: string): boolean {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      return false;
    }
    const voted = this._votes()[userId] ?? [];
    const hasVoted = voted.includes(photoId);
    const nextVotes = hasVoted ? voted.filter((id) => id !== photoId) : [...voted, photoId];
    this._votes.update((votes) => ({ ...votes, [userId]: nextVotes }));
    this._photos.update((photos) =>
      photos.map((photo) =>
        photo.id === photoId
          ? { ...photo, upvotes: Math.max(0, photo.upvotes + (hasVoted ? -1 : 1)) }
          : photo,
      ),
    );
    this.persistPhotos();
    this.persistVotes();
    return !hasVoted;
  }

  addPhoto(photo: Photo): void {
    this._photos.update((photos) => [photo, ...photos]);
    this.persistPhotos();
  }

  removePhoto(id: string): void {
    this._photos.update((photos) => photos.filter((photo) => photo.id !== id));
    this.persistPhotos();
  }

  addComment(photoId: string, text: string, tags: string[] = []): boolean {
    const user = this.auth.currentUser();
    if (!user) {
      return false;
    }
    const photo = this._photos().find((item) => item.id === photoId);
    if (!photo || photo.purpose === 'commercial') {
      return false;
    }
    const trimmed = text.trim();
    if (!trimmed) {
      return false;
    }
    this._comments.update((comments) => [
      ...comments,
      {
        id: globalThis.crypto?.randomUUID?.() ?? `cm-${Date.now()}`,
        photoId,
        authorId: user.id,
        text: trimmed,
        tags,
        createdAt: new Date().toISOString(),
      },
    ]);
    this.persistComments();
    return true;
  }

  private persistPhotos(): void {
    this.storage.write('photos', this._photos());
  }

  private persistComments(): void {
    this.storage.write('comments', this._comments());
  }

  private persistVotes(): void {
    this.storage.write('votes', this._votes());
  }
}
