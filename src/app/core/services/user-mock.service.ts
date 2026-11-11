import { Injectable, inject, signal } from '@angular/core';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';

export const DEMO_USER_ID = 'usr-001';

const SEED_USERS: User[] = [
  {
    id: DEMO_USER_ID,
    username: 'tu-usuario',
    displayName: 'Tu Nombre',
    avatarUrl:
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=200&q=80',
    bio: 'Fotografía de paisaje y retrato. Disponible para proyectos.',
    location: 'Asunción, Paraguay',
    links: [
      { label: 'Instagram', url: 'https://instagram.com' },
      { label: 'Sitio web', url: 'https://example.com' },
    ],
    specialties: ['Paisaje', 'Retrato'],
    equipment: ['Sony A7 IV', 'FE 24-70mm F2.8 GM II', 'Trípode Gitzo'],
    contactEmail: 'tu-usuario@nandugrid.app',
  },
  {
    id: 'usr-002',
    username: 'camila-rojas',
    displayName: 'Camila Rojas',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    bio: 'Paisajista. Busco la luz del amanecer en la cordillera y el litoral.',
    location: 'Encarnación, Paraguay',
    links: [{ label: 'Instagram', url: 'https://instagram.com/camilarojas' }],
    specialties: ['Paisaje', 'Naturaleza'],
    equipment: ['Sony A7 IV', 'FE 16-35mm F2.8 GM', 'Filtro polarizador'],
    contactEmail: 'camila@nandugrid.app',
  },
  {
    id: 'usr-003',
    username: 'diego-fernandez',
    displayName: 'Diego Fernández',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    bio: 'Retrato editorial y documental. Trabajo con luz natural y estudio.',
    location: 'Asunción, Paraguay',
    links: [
      { label: 'Instagram', url: 'https://instagram.com/diegofernandez' },
      { label: 'Sitio web', url: 'https://diegofernandez.example.com' },
    ],
    specialties: ['Retrato', 'Editorial', 'Evento'],
    equipment: ['Canon EOS R6', 'RF 50mm F1.2 L USM', 'RF 85mm F1.2 L'],
    contactEmail: 'diego@nandugrid.app',
  },
  {
    id: 'usr-004',
    username: 'lucia-mendez',
    displayName: 'Lucía Méndez',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    bio: 'Fotografía nocturna y astrofotografía. Cielos limpios del Chaco.',
    location: 'Filadelfia, Paraguay',
    links: [{ label: 'Instagram', url: 'https://instagram.com/luciamendez' }],
    specialties: ['Nocturna', 'Astrofotografía', 'Producto'],
    equipment: ['Nikon Z8', 'NIKKOR Z 14-24mm f/2.8 S', 'Star tracker'],
    contactEmail: 'lucia@nandugrid.app',
  },
];

@Injectable({ providedIn: 'root' })
export class UserMockService {
  private readonly storage = inject(StorageService);
  private readonly _users = signal<User[]>(this.loadUsers());
  readonly users = this._users.asReadonly();

  private loadUsers(): User[] {
    const stored = this.storage.read<User[]>('users', []);
    if (!stored.length) {
      return SEED_USERS;
    }
    const merged = new Map(SEED_USERS.map((user) => [user.id, user]));
    stored.forEach((user) => {
      const current = merged.get(user.id);
      merged.set(user.id, current ? { ...current, ...user } : user);
    });
    return [...merged.values()];
  }

  byId(id: string): User | undefined {
    return this._users().find((user) => user.id === id);
  }

  byUsername(username: string): User | undefined {
    return this._users().find((user) => user.username === username);
  }

  all(): User[] {
    return this._users();
  }

  isUsernameAvailable(username: string, exceptId?: string): boolean {
    return !this._users().some((user) => user.username === username && user.id !== exceptId);
  }

  upsert(user: User): void {
    this._users.update((users) => {
      const exists = users.some((item) => item.id === user.id);
      return exists ? users.map((item) => (item.id === user.id ? user : item)) : [...users, user];
    });
    this.persist();
  }

  private persist(): void {
    this.storage.write('users', this._users());
  }
}
