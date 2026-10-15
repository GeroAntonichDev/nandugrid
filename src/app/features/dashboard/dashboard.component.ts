import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">Próximamente</p>
      <h1 class="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Panel del fotógrafo
      </h1>
      <p class="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-400">
        Métricas, gestión de fotos y configuración del perfil privado.
      </p>
      <a routerLink="/" class="btn-secondary mt-8">Volver al feed</a>
    </section>
  `,
})
export class DashboardComponent {}
