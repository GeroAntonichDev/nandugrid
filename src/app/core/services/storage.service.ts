import { Injectable } from '@angular/core';

const PREFIX = 'nandugrid.v1.';

@Injectable({ providedIn: 'root' })
export class StorageService {
  readonly prefix = PREFIX;

  read<T>(key: string, fallback: T): T {
    try {
      const raw = globalThis.localStorage?.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  write<T>(key: string, value: T): void {
    try {
      globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Cuota excedida o storage no disponible: el estado sigue en memoria.
    }
  }

  remove(key: string): void {
    try {
      globalThis.localStorage?.removeItem(PREFIX + key);
    } catch {
      // Ignorado: storage no disponible.
    }
  }

  clearAll(): void {
    try {
      const storage = globalThis.localStorage;
      if (!storage) {
        return;
      }
      const keys: string[] = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(PREFIX)) {
          keys.push(key);
        }
      }
      keys.forEach((key) => storage.removeItem(key));
    } catch {
      // Ignorado: storage no disponible.
    }
  }
}
