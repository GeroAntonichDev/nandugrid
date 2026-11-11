import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Service } from '../../core/models/service.model';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { ServiceInput, ServiceMockService } from '../../core/services/service-mock.service';
import { ToastService } from '../../core/services/toast.service';
import { LoginWallComponent } from '../../shared/components/login-wall/login-wall.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [LoginWallComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isAuthenticated()) {
      <section class="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
        <header class="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">Catálogo</p>
            <h1 class="mt-2 font-display text-3xl font-semibold text-white">Mis servicios</h1>
            <p class="mt-2 max-w-lg text-sm text-neutral-400">
              Publicá lo que ofrecés para que otros fotógrafos y clientes puedan contratarte.
            </p>
          </div>
          <button type="button" class="btn-accent px-5 py-3" (click)="newService()">
            Nuevo servicio
          </button>
        </header>

        <div class="mt-8 grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <form class="h-fit rounded-3xl border border-ink-800 bg-ink-900 p-6" (submit)="save($event)">
            <h2 class="font-display text-lg font-medium text-white">
              {{ editingId() ? 'Editar servicio' : 'Crear servicio' }}
            </h2>

            <div class="mt-4 space-y-4">
              <label class="block">
                <span class="field-label">Título</span>
                <input
                  class="input"
                  required
                  maxlength="80"
                  placeholder="Ej: Retrato editorial"
                  [value]="title()"
                  (input)="title.set($any($event.target).value)"
                />
              </label>
              <label class="block">
                <span class="field-label">Descripción</span>
                <textarea
                  class="input min-h-24 resize-y"
                  required
                  maxlength="280"
                  placeholder="Qué incluye el servicio..."
                  [value]="description()"
                  (input)="description.set($any($event.target).value)"
                ></textarea>
              </label>
              <label class="block">
                <span class="field-label">Precio (USD)</span>
                <input
                  class="input"
                  type="number"
                  min="1"
                  required
                  [value]="price() ?? ''"
                  (input)="price.set($any($event.target).valueAsNumber || null)"
                />
              </label>
              <div class="grid grid-cols-2 gap-3">
                <label class="block">
                  <span class="field-label">Entregables</span>
                  <input
                    class="input"
                    maxlength="80"
                    placeholder="15 fotos editadas"
                    [value]="deliverables()"
                    (input)="deliverables.set($any($event.target).value)"
                  />
                </label>
                <label class="block">
                  <span class="field-label">Plazo</span>
                  <input
                    class="input"
                    maxlength="40"
                    placeholder="5 días"
                    [value]="turnaround()"
                    (input)="turnaround.set($any($event.target).value)"
                  />
                </label>
              </div>
              <label class="flex items-center gap-2 text-sm text-neutral-300">
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-ink-700 bg-ink-900"
                  [checked]="isPublished()"
                  (change)="isPublished.set($any($event.target).checked)"
                />
                Publicado en mi portafolio
              </label>
            </div>

            <div class="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
              <button type="submit" class="btn-accent px-4 py-2.5 text-xs" [disabled]="!canSave()">
                {{ editingId() ? 'Guardar cambios' : 'Crear servicio' }}
              </button>
              @if (editingId()) {
                <button type="button" class="btn-secondary px-4 py-2.5 text-xs" (click)="newService()">
                  Cancelar
                </button>
              }
            </div>
          </form>

          <div class="space-y-4">
            @for (service of services(); track service.id) {
              <article class="rounded-2xl border border-ink-800 bg-ink-900 p-5">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="font-display text-lg font-medium text-white">{{ service.title }}</h3>
                      <span [class]="statusBadgeClass(service.isPublished)">
                        {{ service.isPublished ? 'Publicado' : 'Pausado' }}
                      </span>
                    </div>
                    <p class="mt-2 text-sm leading-relaxed text-neutral-400">{{ service.description }}</p>
                    <p class="mt-2 text-sm text-accent-300">
                      USD {{ service.price.toLocaleString('es-PY') }}
                    </p>
                    <div class="mt-1 flex flex-wrap gap-3 text-[11px] text-neutral-500">
                      @if (service.deliverables) {
                        <span>{{ service.deliverables }}</span>
                      }
                      @if (service.turnaround) {
                        <span>· {{ service.turnaround }}</span>
                      }
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button type="button" class="btn-secondary px-3 py-2 text-xs" (click)="edit(service)">
                      Editar
                    </button>
                    <button type="button" class="btn-secondary px-3 py-2 text-xs" (click)="togglePublished(service)">
                      {{ service.isPublished ? 'Pausar' : 'Publicar' }}
                    </button>
                    <button
                      type="button"
                      class="btn-secondary border-red-500/30 px-3 py-2 text-xs text-red-300 hover:border-red-500/60"
                      (click)="remove(service)"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            } @empty {
              <div class="rounded-2xl border border-dashed border-ink-700 py-16 text-center">
                <p class="text-sm text-neutral-400">Todavía no creaste servicios.</p>
                <p class="mt-1 text-xs text-neutral-500">Usá el formulario para publicar el primero.</p>
              </div>
            }
          </div>
        </div>
      </section>
    } @else {
      <app-login-wall
        variant="page"
        title="Inicia sesión para gestionar tus servicios"
        message="Necesitas una sesión activa para crear y publicar servicios."
        actionLabel="Entrar en modo demostración"
      />
    }
  `,
})
export class ServicesComponent {
  private readonly auth = inject(AuthMockService);
  private readonly serviceService = inject(ServiceMockService);
  private readonly toast = inject(ToastService);

  readonly currentUser = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly services = computed(() => {
    const id = this.currentUser()?.id;
    return id ? this.serviceService.byOwner(id) : [];
  });

  readonly editingId = signal<string | null>(null);
  readonly title = signal('');
  readonly description = signal('');
  readonly price = signal<number | null>(null);
  readonly deliverables = signal('');
  readonly turnaround = signal('');
  readonly isPublished = signal(true);

  readonly canSave = computed(() => {
    const price = this.price();
    return Boolean(this.title().trim() && this.description().trim() && price && price > 0);
  });

  statusBadgeClass(published: boolean): string {
    const base = 'rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider';
    return published
      ? `${base} border-emerald-500/40 text-emerald-300`
      : `${base} border-white/10 text-neutral-500`;
  }

  newService(): void {
    this.editingId.set(null);
    this.title.set('');
    this.description.set('');
    this.price.set(null);
    this.deliverables.set('');
    this.turnaround.set('');
    this.isPublished.set(true);
  }

  edit(service: Service): void {
    this.editingId.set(service.id);
    this.title.set(service.title);
    this.description.set(service.description);
    this.price.set(service.price);
    this.deliverables.set(service.deliverables ?? '');
    this.turnaround.set(service.turnaround ?? '');
    this.isPublished.set(service.isPublished);
  }

  save(event: Event): void {
    event.preventDefault();
    const user = this.currentUser();
    if (!user || !this.canSave()) {
      return;
    }
    const input: ServiceInput = {
      title: this.title().trim(),
      description: this.description().trim(),
      price: this.price() ?? 0,
      currency: 'USD',
      isPublished: this.isPublished(),
      deliverables: this.deliverables().trim() || undefined,
      turnaround: this.turnaround().trim() || undefined,
    };
    const editingId = this.editingId();
    if (editingId) {
      this.serviceService.update(editingId, input);
      this.toast.show('Servicio actualizado');
    } else {
      this.serviceService.create(user.id, input);
      this.toast.show('Servicio creado');
    }
    this.newService();
  }

  togglePublished(service: Service): void {
    this.serviceService.togglePublished(service.id);
    this.toast.show(service.isPublished ? 'Servicio pausado' : 'Servicio publicado', 'info');
  }

  remove(service: Service): void {
    this.serviceService.remove(service.id);
    if (this.editingId() === service.id) {
      this.newService();
    }
    this.toast.show('Servicio eliminado', 'info');
  }
}
