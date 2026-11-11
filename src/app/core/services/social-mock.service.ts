import { Injectable, inject, signal } from '@angular/core';
import { Favorite, Follow } from '../models/social.model';
import { StorageService } from './storage.service';

interface SocialState {
  follows: Follow[];
  favorites: Favorite[];
}

const EMPTY_STATE: SocialState = { follows: [], favorites: [] };

@Injectable({ providedIn: 'root' })
export class SocialMockService {
  private readonly storage = inject(StorageService);
  private readonly _state = signal<SocialState>(this.storage.read('social', EMPTY_STATE));
  readonly state = this._state.asReadonly();

  isFollowing(followerId: string, followingId: string): boolean {
    return this._state().follows.some(
      (follow) => follow.followerId === followerId && follow.followingId === followingId,
    );
  }

  toggleFollow(followerId: string, followingId: string): boolean {
    const exists = this.isFollowing(followerId, followingId);
    this._state.update((state) => ({
      ...state,
      follows: exists
        ? state.follows.filter(
            (follow) =>
              !(follow.followerId === followerId && follow.followingId === followingId),
          )
        : [
            ...state.follows,
            {
              id: globalThis.crypto?.randomUUID?.() ?? `follow-${Date.now()}`,
              followerId,
              followingId,
              createdAt: new Date().toISOString(),
            },
          ],
    }));
    this.persist();
    return !exists;
  }

  isFavorite(userId: string, photographerId: string): boolean {
    return this._state().favorites.some(
      (favorite) => favorite.userId === userId && favorite.photographerId === photographerId,
    );
  }

  toggleFavorite(userId: string, photographerId: string): boolean {
    const exists = this.isFavorite(userId, photographerId);
    this._state.update((state) => ({
      ...state,
      favorites: exists
        ? state.favorites.filter(
            (favorite) =>
              !(favorite.userId === userId && favorite.photographerId === photographerId),
          )
        : [
            ...state.favorites,
            {
              id: globalThis.crypto?.randomUUID?.() ?? `fav-${Date.now()}`,
              userId,
              photographerId,
              createdAt: new Date().toISOString(),
            },
          ],
    }));
    this.persist();
    return !exists;
  }

  followingIds(userId: string): string[] {
    return this._state()
      .follows.filter((follow) => follow.followerId === userId)
      .map((follow) => follow.followingId);
  }

  followerIds(userId: string): string[] {
    return this._state()
      .follows.filter((follow) => follow.followingId === userId)
      .map((follow) => follow.followerId);
  }

  favoriteIds(userId: string): string[] {
    return this._state()
      .favorites.filter((favorite) => favorite.userId === userId)
      .map((favorite) => favorite.photographerId);
  }

  private persist(): void {
    this.storage.write('social', this._state());
  }
}
