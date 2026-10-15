import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
      <nav class="mx-auto flex h-16 max-w-shell items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          routerLink="/"
          class="font-display text-base font-semibold uppercase tracking-[0.3em] text-white transition hover:text-accent-300 sm:text-lg"
        >
          ÑanduGrid
        </a>

        <div class="flex items-center gap-1">
          <a
            routerLink="/"
            routerLinkActive="bg-white/5 text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="hidden rounded-full px-4 py-2 text-sm text-neutral-400 transition hover:text-white sm:block"
          >
            Feed
          </a>

          <a
            routerLink="/u/tu-usuario"
            routerLinkActive="bg-white/5 text-white"
            class="hidden rounded-full px-4 py-2 text-sm text-neutral-400 transition hover:text-white sm:block"
          >
            Mi Perfil
          </a>

          <a routerLink="/upload" class="btn-accent px-5 py-2.5 text-[13px]">
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Subir Foto
          </a>
        </div>
      </nav>
    </header>
  `,
})
export class NavbarComponent {}
