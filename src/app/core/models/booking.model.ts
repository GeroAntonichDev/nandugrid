export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'completed';

export interface BookingRequest {
  id: string;
  clientId: string;
  photographerId: string;
  serviceId?: string;
  photoId?: string;
  price: number;
  currency: string;
  eventDate: string;
  message: string;
  status: BookingStatus;
  createdAt: string;
}
