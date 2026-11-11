import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Photo } from '../../../core/models/photo.model';
import { PhotoDetailModalComponent } from './photo-detail-modal.component';

describe('PhotoDetailModalComponent — reglas de negocio', () => {
  const commercialPhoto: Photo = {
    id: 'ph-test-commercial',
    url: 'https://example.com/photo.jpg',
    purpose: 'commercial',
    exif: {},
    upvotes: 0,
    title: 'Sesión comercial',
    authorId: 'usr-002',
    category: 'Retrato',
    tags: [],
    createdAt: new Date().toISOString(),
    price: 100,
  };

  const communityPhoto: Photo = {
    id: 'ph-test-community',
    url: 'https://example.com/community.jpg',
    purpose: 'feedback',
    exif: { camera: 'Sony A7 IV' },
    upvotes: 3,
    title: 'Foto comunitaria',
    authorId: 'usr-003',
    category: 'Naturaleza',
    tags: ['bosque'],
    createdAt: new Date().toISOString(),
  };

  let fixture: ComponentFixture<PhotoDetailModalComponent>;

  function render(photo: Photo): string {
    fixture = TestBed.createComponent(PhotoDetailModalComponent);
    fixture.componentRef.setInput('photo', photo);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  beforeEach(async () => {
    globalThis.localStorage?.clear();
    await TestBed.configureTestingModule({
      imports: [PhotoDetailModalComponent],
    }).compileComponents();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('4.5 · muestra el CTA Contactar / Contratar en fotos comerciales', () => {
    const text = render(commercialPhoto);
    expect(text).toContain('Contactar / Contratar');
  });

  it('4.1 · desactiva la crítica en fotos comerciales', () => {
    const text = render(commercialPhoto);
    expect(text).toContain('La crítica técnica está desactivada');
    expect(text).not.toContain('Sé el primero en comentar');
  });

  it('P1 · muestra etiquetas de crítica y control de marca de agua', () => {
    const text = render(communityPhoto);
    expect(text).toContain('Composición');
    expect(text).toContain('Iluminación');
    expect(text).toContain('Marca de agua');
    expect(text).toContain('Sé el primero en comentar');
  });
});
