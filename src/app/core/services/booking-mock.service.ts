import { Injectable, inject, signal } from '@angular/core';
import { BookingRequest, BookingStatus } from '../models/booking.model';
import { StorageService } from './storage.service';

const SEED_BOOKINGS: BookingRequest[] = [
  {
    id: 'bk-001',
    clientId: 'usr-001',
    photographerId: 'usr-002',
    serviceId: 'svc-010',
    price: 150,
    currency: 'USD',
    eventDate: '2026-12-05',
    message: 'Quiero coordinar una salida al amanecer por el litoral.',
    status: 'pending',
    createdAt: '2026-11-02T14:20:00.000Z',
  },
  {
    id: 'bk-002',
    clientId: 'usr-003',
    photographerId: 'usr-001',
    serviceId: 'svc-001',
    price: 120,
    currency: 'USD',
    eventDate: '2026-11-28',
    message: 'Necesito retratos editoriales para actualizar mi portafolio.',
    status: 'pending',
    createdAt: '2026-11-04T09:05:00.000Z',
  },
  {
    id: 'bk-003',
    clientId: 'usr-004',
    photographerId: 'usr-001',
    serviceId: 'svc-002',
    price: 180,
    currency: 'USD',
    eventDate: '2026-11-20',
    message: 'Fotos de producto para el catálogo de mi tienda.',
    status: 'accepted',
    createdAt: '2026-10-30T18:40:00.000Z',
  },
];

export interface BookingInput {
  clientId: string;
  photographerId: string;
  serviceId?: string;
  photoId?: string;
  price: number;
  currency: string;
  eventDate: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class BookingMockService {
  private readonly storage = inject(StorageService);
  private readonly _bookings = signal<BookingRequest[]>(
    this.storage.read('bookings', SEED_BOOKINGS),
  );
  readonly bookings = this._bookings.asReadonly();

  received(userId: string): BookingRequest[] {
    return this._bookings()
      .filter((booking) => booking.photographerId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  sent(userId: string): BookingRequest[] {
    return this._bookings()
      .filter((booking) => booking.clientId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  pendingReceived(userId: string): number {
    return this.received(userId).filter((booking) => booking.status === 'pending').length;
  }

  create(input: BookingInput): BookingRequest {
    const booking: BookingRequest = {
      ...input,
      id: globalThis.crypto?.randomUUID?.() ?? `bk-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this._bookings.update((bookings) => [booking, ...bookings]);
    this.persist();
    return booking;
  }

  updateStatus(id: string, status: BookingStatus): void {
    this._bookings.update((bookings) =>
      bookings.map((booking) => (booking.id === id ? { ...booking, status } : booking)),
    );
    this.persist();
  }

  private persist(): void {
    this.storage.write('bookings', this._bookings());
  }
}
