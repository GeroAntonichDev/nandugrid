import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '../models/user.model';
import { DEMO_USER_ID, UserMockService } from './user-mock.service';

@Injectable({ providedIn: 'root' })
export class AuthMockService {
  private readonly users = inject(UserMockService);
  private readonly _currentUserId = signal<string | null>(DEMO_USER_ID);

  readonly demoProfile = computed(() => this.users.byId(DEMO_USER_ID)!);
  readonly currentUser = computed(() => {
    const id = this._currentUserId();
    return id ? (this.users.byId(id) ?? null) : null;
  });
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  login(): Promise<User> {
    this._currentUserId.set(DEMO_USER_ID);
    return Promise.resolve(this.users.byId(DEMO_USER_ID)!);
  }

  logout(): void {
    this._currentUserId.set(null);
  }

  updateProfile(updates: Partial<User>): User {
    const current = this.users.byId(DEMO_USER_ID)!;
    const updated: User = {
      ...current,
      ...updates,
      links: updates.links ?? current.links,
    };
    this.users.upsert(updated);
    return updated;
  }
}
