import { TestBed } from '@angular/core/testing';
import { AuthMockService } from './auth-mock.service';
import { PhotoMockService } from './photo-mock.service';

describe('PhotoMockService — reglas de negocio', () => {
  let service: PhotoMockService;
  let auth: AuthMockService;

  beforeEach(() => {
    globalThis.localStorage?.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotoMockService);
    auth = TestBed.inject(AuthMockService);
    void auth.login();
  });

  it('4.2 · el feed excluye las fotos comerciales', () => {
    expect(service.photos().some((photo) => photo.purpose === 'commercial')).toBeTrue();
    expect(service.feedPhotos().some((photo) => photo.purpose === 'commercial')).toBeFalse();
  });

  it('4.4 · el feed se ordena por upvotes descendente', () => {
    const upvotes = service.feedPhotos().map((photo) => photo.upvotes);
    const sorted = [...upvotes].sort((a, b) => b - a);
    expect(upvotes).toEqual(sorted);
  });

  it('4.1 · addComment rechaza fotos comerciales', () => {
    const commercial = service.photos().find((photo) => photo.purpose === 'commercial');
    expect(commercial).toBeTruthy();
    const before = service.comments().length;

    expect(service.addComment(commercial!.id, 'Comentario')).toBeFalse();
    expect(service.comments().length).toBe(before);
  });

  it('4.1 · addComment exige una sesión activa', () => {
    auth.logout();
    const photo = service.photos().find((item) => item.purpose !== 'commercial');
    expect(photo).toBeTruthy();
    const before = service.comments().length;

    expect(service.addComment(photo!.id, 'Comentario')).toBeFalse();
    expect(service.comments().length).toBe(before);
  });

  it('4.1 · addComment acepta fotos no comerciales con sesión', () => {
    const photo = service.photos().find((item) => item.purpose !== 'commercial');
    expect(photo).toBeTruthy();
    const before = service.comments().length;

    expect(service.addComment(photo!.id, '  Muy buena  ')).toBeTrue();
    const comments = service.comments();
    expect(comments.length).toBe(before + 1);
    expect(comments[comments.length - 1].text).toBe('Muy buena');
  });

  it('P0.1 · el voto es único por usuario y se puede quitar', () => {
    const photo = service.photos().find((item) => item.purpose !== 'commercial');
    expect(photo).toBeTruthy();
    const initial = photo!.upvotes;

    expect(service.hasUpvoted(photo!.id)).toBeFalse();
    expect(service.toggleUpvote(photo!.id)).toBeTrue();
    expect(service.hasUpvoted(photo!.id)).toBeTrue();
    expect(service.photos().find((item) => item.id === photo!.id)!.upvotes).toBe(initial + 1);

    expect(service.toggleUpvote(photo!.id)).toBeFalse();
    expect(service.hasUpvoted(photo!.id)).toBeFalse();
    expect(service.photos().find((item) => item.id === photo!.id)!.upvotes).toBe(initial);
  });
});
