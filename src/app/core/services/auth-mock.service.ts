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

const PROFILE_STORAGE_KEY = 'nandugrid.profile';

function loadProfile(): User {
  try {
    const stored = globalThis.localStorage?.getItem(PROFILE_STORAGE_KEY);
    if (!stored) {
      return MOCK_USER;
    }
    const profile = JSON.parse(stored) as Partial<User>;
    return {
      ...MOCK_USER,
      ...profile,
      links: Array.isArray(profile.links) ? profile.links : MOCK_USER.links,
    };
  } catch {
    return MOCK_USER;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthMockService {
  private readonly _profile = signal<User>(loadProfile());
  private readonly _currentUser = signal<User | null>(this._profile());

  readonly demoProfile = this._profile.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  login(): Promise<User> {
    const profile = this._profile();
    this._currentUser.set(profile);
    return Promise.resolve(profile);
  }

  logout(): void {
    this._currentUser.set(null);
  }

  updateProfile(updates: Partial<User>): User {
    const profile = { ...this._profile(), ...updates };
    this._profile.set(profile);
    if (this._currentUser()) {
      this._currentUser.set(profile);
    }
    try {
      globalThis.localStorage?.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      return profile;
    }
    return profile;
  }
}
