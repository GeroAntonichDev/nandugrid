import { TestBed } from '@angular/core/testing';
import { BookingMockService } from './booking-mock.service';
import { PhotoMockService } from './photo-mock.service';
import { ServiceMockService } from './service-mock.service';
import { SocialMockService } from './social-mock.service';
import { UserMockService } from './user-mock.service';

describe('P1 — servicios mock', () => {
  let services: ServiceMockService;
  let bookings: BookingMockService;
  let social: SocialMockService;
  let users: UserMockService;
  let photos: PhotoMockService;

  beforeEach(() => {
    globalThis.localStorage?.clear();
    TestBed.configureTestingModule({});
    services = TestBed.inject(ServiceMockService);
    bookings = TestBed.inject(BookingMockService);
    social = TestBed.inject(SocialMockService);
    users = TestBed.inject(UserMockService);
    photos = TestBed.inject(PhotoMockService);
  });

  it('crea, edita, pausa y elimina servicios', () => {
    const created = services.create('usr-001', {
      title: 'Servicio de prueba',
      description: 'Descripción',
      price: 50,
      currency: 'USD',
      isPublished: true,
    });
    expect(services.byOwner('usr-001').some((item) => item.id === created.id)).toBeTrue();

    services.update(created.id, { price: 75 });
    expect(services.byId(created.id)!.price).toBe(75);

    services.togglePublished(created.id);
    expect(services.byId(created.id)!.isPublished).toBeFalse();

    services.remove(created.id);
    expect(services.byId(created.id)).toBeUndefined();
  });

  it('crea reservas pendientes y actualiza su estado', () => {
    const booking = bookings.create({
      clientId: 'usr-001',
      photographerId: 'usr-002',
      price: 100,
      currency: 'USD',
      eventDate: '2026-12-01',
      message: 'Hola',
    });

    expect(booking.status).toBe('pending');
    expect(bookings.pendingReceived('usr-002')).toBeGreaterThan(0);

    bookings.updateStatus(booking.id, 'accepted');
    expect(bookings.bookings().find((item) => item.id === booking.id)!.status).toBe('accepted');
  });

  it('alterna seguir y favoritos por usuario', () => {
    expect(social.isFollowing('usr-001', 'usr-002')).toBeFalse();
    expect(social.toggleFollow('usr-001', 'usr-002')).toBeTrue();
    expect(social.followingIds('usr-001')).toContain('usr-002');

    expect(social.toggleFavorite('usr-001', 'usr-003')).toBeTrue();
    expect(social.favoriteIds('usr-001')).toContain('usr-003');
    expect(social.toggleFavorite('usr-001', 'usr-003')).toBeFalse();
  });

  it('resuelve usuarios y fotos por autor', () => {
    expect(users.byUsername('camila-rojas')?.id).toBe('usr-002');

    const byAuthor = photos.getByAuthorId('usr-002');
    expect(byAuthor.length).toBeGreaterThan(0);
    expect(byAuthor.every((photo) => photo.authorId === 'usr-002')).toBeTrue();
  });
});
