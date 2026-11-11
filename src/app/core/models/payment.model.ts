export type PaymentStatus = 'paid' | 'refunded';

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: PaymentStatus;
  createdAt: string;
}
