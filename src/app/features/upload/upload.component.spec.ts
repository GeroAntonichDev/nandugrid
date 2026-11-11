import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { PhotoMockService } from '../../core/services/photo-mock.service';
import { UploadComponent } from './upload.component';

describe('UploadComponent — reglas de publicación', () => {
  let component: UploadComponent;
  let service: PhotoMockService;

  beforeEach(async () => {
    globalThis.localStorage?.clear();
    await TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { navigate: () => Promise.resolve(true) } }],
    }).compileComponents();

    const auth = TestBed.inject(AuthMockService);
    void auth.login();
    service = TestBed.inject(PhotoMockService);

    const fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    component.category.set('Paisaje');
  });

  it('4.3 · no adjunta EXIF en fotos hobby aunque haya datos cargados', () => {
    component.purpose.set('hobby');
    component.previewUrl.set('data:image/png;base64,AAAA');
    component.title.set('Hobby sin EXIF');
    component.camera.set('Canon R6');
    component.publish();

    const photo = service.photos().find((item) => item.title === 'Hobby sin EXIF');
    expect(photo).toBeTruthy();
    expect(photo!.exif).toEqual({});
  });

  it('4.3 · adjunta EXIF en feedback', () => {
    component.purpose.set('feedback');
    component.previewUrl.set('data:image/png;base64,AAAA');
    component.title.set('Feedback con EXIF');
    component.camera.set('Canon R6');
    component.publish();

    const photo = service.photos().find((item) => item.title === 'Feedback con EXIF');
    expect(photo).toBeTruthy();
    expect(photo!.exif.camera).toBe('Canon R6');
  });

  it('P0.3 · no publica feedback sin cámara', () => {
    component.purpose.set('feedback');
    component.previewUrl.set('data:image/png;base64,AAAA');
    component.title.set('Feedback sin cámara');
    component.publish();

    expect(service.photos().some((item) => item.title === 'Feedback sin cámara')).toBeFalse();
  });

  it('P0.3 · no publica comercial sin precio mayor a cero', () => {
    component.purpose.set('commercial');
    component.previewUrl.set('data:image/png;base64,AAAA');
    component.title.set('Comercial sin precio');
    component.publish();

    expect(service.photos().some((item) => item.title === 'Comercial sin precio')).toBeFalse();
  });

  it('P1 · publica con autor, categoría, descripción y etiquetas', () => {
    component.purpose.set('hobby');
    component.previewUrl.set('data:image/png;base64,AAAA');
    component.title.set('Con metadatos');
    component.category.set('Calle');
    component.description.set('Una calle de noche');
    component.tagsInput.set('urbano, noche');
    component.publish();

    const photo = service.photos().find((item) => item.title === 'Con metadatos');
    expect(photo).toBeTruthy();
    expect(photo!.authorId).toBe('usr-001');
    expect(photo!.category).toBe('Calle');
    expect(photo!.description).toBe('Una calle de noche');
    expect(photo!.tags).toEqual(['urbano', 'noche']);
  });

  it('P0.10 · cambiar propósito limpia los campos EXIF y el precio', () => {
    component.purpose.set('commercial');
    component.camera.set('Canon R6');
    component.lens.set('RF 50mm');
    component.iso.set(400);
    component.aperture.set('f/1.8');
    component.shutter.set('1/500');
    component.price.set(150);

    component.changePurpose();

    expect(component.purpose()).toBeNull();
    expect(component.camera()).toBe('');
    expect(component.lens()).toBe('');
    expect(component.iso()).toBeNull();
    expect(component.aperture()).toBe('');
    expect(component.shutter()).toBe('');
    expect(component.price()).toBeNull();
  });
});
