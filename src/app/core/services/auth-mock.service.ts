import { Injectable, computed, signal } from '@angular/core';
import { User } from '../models/user.model';

const MOCK_USER: User = {
  id: 'usr-001',
  username: 'tu-usuario',
  displayName: 'Tu Nombre',
  avatarUrl: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=200&q=80',
  bio: 'Fotografía de paisaje y retrato. Disponible para proyectos.',
  location: 'Asunción, Paraguay',
  links: [
    { label: 'Instagram', url: 'https://instagram.com' },
    { label: 'Sitio web', url: 'https://example.com' },
  ],
};

@Injectable({ providedIn: 'root' })
export class AuthMockService {
  private readonly _currentUser = signal<User | null>(MOCK_USER);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  login(): Promise<User> {
    this._currentUser.set(MOCK_USER);
    return Promise.resolve(MOCK_USER);
  }

  logout(): void {
    this._currentUser.set(null);
  }
}
