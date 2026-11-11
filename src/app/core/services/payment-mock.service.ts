import { Injectable, inject, signal } from '@angular/core';
import { Payment } from '../models/payment.model';
import { StorageService } from './storage.service';

export interface PaymentInput {
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  method?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentMockService {
  private readonly storage = inject(StorageService);
  private readonly _payments = signal<Payment[]>(this.storage.read('payments', []));
  readonly payments = this._payments.asReadonly();

  byBooking(bookingId: string): Payment | undefined {
    return this._payments().find(
      (payment) => payment.bookingId === bookingId && payment.status === 'paid',
    );
  }

  create(input: PaymentInput): Payment {
    const payment: Payment = {
      id: globalThis.crypto?.randomUUID?.() ?? `pay-${Date.now()}`,
      bookingId: input.bookingId,
      userId: input.userId,
      amount: input.amount,
      currency: input.currency,
      method: input.method ?? 'Tarjeta de prueba',
      status: 'paid',
      createdAt: new Date().toISOString(),
    };
    this._payments.update((payments) => [payment, ...payments]);
    this.persist();
    return payment;
  }

  private persist(): void {
    this.storage.write('payments', this._payments());
  }
}
