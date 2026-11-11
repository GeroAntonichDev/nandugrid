import { Injectable, inject, signal } from '@angular/core';
import { Service } from '../models/service.model';
import { StorageService } from './storage.service';

const SEED_SERVICES: Service[] = [
  {
    id: 'svc-001',
    ownerId: 'usr-001',
    title: 'Retrato editorial',
    description: 'Sesión individual en exteriores o estudio con edición incluida.',
    price: 120,
    currency: 'USD',
    isPublished: true,
    deliverables: '15 fotos editadas',
    turnaround: '5 días',
  },
  {
    id: 'svc-002',
    ownerId: 'usr-001',
    title: 'Fotografía de producto',
    description: 'Imágenes listas para catálogo y redes sociales.',
    price: 180,
    currency: 'USD',
    isPublished: true,
    deliverables: '20 imágenes en alta',
    turnaround: '4 días',
  },
  {
    id: 'svc-003',
    ownerId: 'usr-001',
    title: 'Cobertura de eventos',
    description: 'Registro documental de jornadas y celebraciones.',
    price: 350,
    currency: 'USD',
    isPublished: false,
    deliverables: 'Galería completa',
    turnaround: '7 días',
  },
  {
    id: 'svc-010',
    ownerId: 'usr-002',
    title: 'Sesión de paisaje',
    description: 'Salida fotográfica guiada al amanecer en locaciones del litoral.',
    price: 150,
    currency: 'USD',
    isPublished: true,
    deliverables: '10 fotos editadas',
    turnaround: '6 días',
  },
  {
    id: 'svc-011',
    ownerId: 'usr-002',
    title: 'Boda en exteriores',
    description: 'Cobertura completa de ceremonia y recepción en exteriores.',
    price: 900,
    currency: 'USD',
    isPublished: true,
    deliverables: '300 fotos + álbum',
    turnaround: '15 días',
  },
  {
    id: 'svc-020',
    ownerId: 'usr-003',
    title: 'Retrato editorial',
    description: 'Retrato con dirección de arte y luz de estudio.',
    price: 200,
    currency: 'USD',
    isPublished: true,
    deliverables: '12 fotos retocadas',
    turnaround: '5 días',
  },
  {
    id: 'svc-021',
    ownerId: 'usr-003',
    title: 'Cobertura de evento',
    description: 'Cobertura fotográfica de eventos corporativos y sociales.',
    price: 450,
    currency: 'USD',
    isPublished: true,
    deliverables: 'Galería completa',
    turnaround: '7 días',
  },
  {
    id: 'svc-030',
    ownerId: 'usr-004',
    title: 'Sesión nocturna',
    description: 'Astrofotografía y paisaje nocturno en el Chaco.',
    price: 250,
    currency: 'USD',
    isPublished: true,
    deliverables: '8 fotos editadas',
    turnaround: '8 días',
  },
  {
    id: 'svc-031',
    ownerId: 'usr-004',
    title: 'Producto en estudio',
    description: 'Bodegón y producto con iluminación controlada.',
    price: 180,
    currency: 'USD',
    isPublished: true,
    deliverables: '15 imágenes',
    turnaround: '4 días',
  },
];

export type ServiceInput = Omit<Service, 'id' | 'ownerId'>;

@Injectable({ providedIn: 'root' })
export class ServiceMockService {
  private readonly storage = inject(StorageService);
  private readonly _services = signal<Service[]>(this.storage.read('services', SEED_SERVICES));
  readonly services = this._services.asReadonly();

  byId(id: string): Service | undefined {
    return this._services().find((service) => service.id === id);
  }

  byOwner(ownerId: string, onlyPublished = false): Service[] {
    return this._services().filter(
      (service) => service.ownerId === ownerId && (!onlyPublished || service.isPublished),
    );
  }

  minPrice(ownerId: string): number | null {
    const prices = this.byOwner(ownerId, true).map((service) => service.price);
    return prices.length ? Math.min(...prices) : null;
  }

  create(ownerId: string, input: ServiceInput): Service {
    const service: Service = {
      ...input,
      id: globalThis.crypto?.randomUUID?.() ?? `svc-${Date.now()}`,
      ownerId,
    };
    this._services.update((services) => [service, ...services]);
    this.persist();
    return service;
  }

  update(id: string, changes: Partial<ServiceInput>): void {
    this._services.update((services) =>
      services.map((service) => (service.id === id ? { ...service, ...changes } : service)),
    );
    this.persist();
  }

  togglePublished(id: string): void {
    this._services.update((services) =>
      services.map((service) =>
        service.id === id ? { ...service, isPublished: !service.isPublished } : service,
      ),
    );
    this.persist();
  }

  remove(id: string): void {
    this._services.update((services) => services.filter((service) => service.id !== id));
    this.persist();
  }

  private persist(): void {
    this.storage.write('services', this._services());
  }
}
