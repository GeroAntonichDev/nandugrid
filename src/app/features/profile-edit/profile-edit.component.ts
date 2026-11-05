import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserLink } from '../../core/models/user.model';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { PhotoMockService } from '../../core/services/photo-mock.service';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isAuthenticated()) {
      <section class="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
        <header class="border-b border-white/10 pb-6">
          <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">Tu cuenta</p>
          <h1 class="mt-2 font-display text-3xl font-semibold text-white">Editar perfil</h1>
          <p class="mt-2 text-sm text-neutral-400">Actualiza la información que aparece en tu portafolio público.</p>
        </header>

        <form class="mt-8 space-y-8" (submit)="save($event)">
          <section class="flex flex-wrap items-center gap-5" aria-labelledby="avatar-title">
            <img [src]="avatarUrl()" [alt]="'Foto de ' + displayName()" class="h-24 w-24 rounded-full object-cover ring-1 ring-white/15" />
            <div>
              <h2 id="avatar-title" class="text-sm font-medium text-white">Foto de perfil</h2>
              <label class="btn-secondary mt-3 cursor-pointer px-4 py-2.5 text-xs">
                Cambiar foto
                <input class="sr-only" type="file" accept="image/*" (change)="selectAvatar($event)" />
              </label>
              <p class="mt-2 text-xs text-neutral-500">Imagen cuadrada recomendada. Máximo 5 MB.</p>
              @if (avatarError()) {
                <p class="mt-2 text-xs text-red-300" role="alert">{{ avatarError() }}</p>
              }
            </div>
          </section>

          <div class="grid gap-5 sm:grid-cols-2">
            <label>
              <span class="field-label">Nombre visible</span>
              <input class="input" autocomplete="name" required maxlength="60" [value]="displayName()" (input)="displayName.set($any($event.target).value)" />
            </label>
            <label>
              <span class="field-label">Nombre de usuario</span>
              <div class="flex items-center rounded-xl border border-ink-700 bg-ink-900 focus-within:border-accent-500 focus-within:ring-1 focus-within:ring-accent-500/40">
                <span class="pl-4 text-sm text-neutral-500">&#64;</span>
                <input class="w-full bg-transparent px-2 py-2.5 text-sm text-white outline-none" autocomplete="username" required minlength="3" maxlength="30" pattern="[\\-a-z0-9]+" [value]="username()" (input)="setUsername($event)" />
              </div>
              <span class="mt-1 block text-xs text-neutral-500">Solo letras minúsculas, números y guiones.</span>
            </label>
            <label class="sm:col-span-2">
              <span class="field-label">Biografía</span>
              <textarea class="input min-h-28 resize-y" maxlength="280" placeholder="Cuéntale a la comunidad qué haces..." [value]="bio()" (input)="bio.set($any($event.target).value)"></textarea>
              <span class="mt-1 block text-right text-xs text-neutral-500">{{ bio().length }}/280</span>
            </label>
            <label class="sm:col-span-2">
              <span class="field-label">Ubicación</span>
              <input class="input" autocomplete="address-level2" maxlength="80" placeholder="Ciudad, país" [value]="location()" (input)="location.set($any($event.target).value)" />
            </label>
          </div>

          <section aria-labelledby="links-title">
            <div class="border-b border-white/10 pb-3">
              <h2 id="links-title" class="font-display text-lg font-medium text-white">Enlaces de contacto</h2>
              <p class="mt-1 text-xs text-neutral-500">Se mostrarán en tu portafolio.</p>
            </div>
            <div class="mt-5 grid gap-5 sm:grid-cols-2">
              <label>
                <span class="field-label">Instagram</span>
                <input class="input" type="url" placeholder="https://instagram.com/usuario" [value]="instagram()" (input)="instagram.set($any($event.target).value)" />
              </label>
              <label>
                <span class="field-label">Sitio web</span>
                <input class="input" type="url" placeholder="https://tusitio.com" [value]="website()" (input)="website.set($any($event.target).value)" />
              </label>
            </div>
          </section>

          <div class="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <div aria-live="polite">
              @if (saved()) {
                <p class="text-sm text-emerald-300">Perfil guardado en este navegador.</p>
              }
            </div>
            <div class="flex gap-2">
              <a [routerLink]="portfolioLink()" class="btn-secondary px-4 py-3">Ver portafolio</a>
              <button type="submit" class="btn-accent px-5 py-3">Guardar cambios</button>
            </div>
          </div>
        </form>
      </section>
    } @else {
      <section class="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">Acceso privado</p>
        <h1 class="mt-3 font-display text-3xl font-semibold text-white">Inicia sesión para editar tu perfil</h1>
        <button type="button" class="btn-accent mt-8" (click)="login()">Entrar en modo demostración</button>
      </section>
    }
  `,
})
export class ProfileEditComponent {
  private readonly auth = inject(AuthMockService);
  private readonly photos = inject(PhotoMockService);
  private readonly initialUser = this.auth.currentUser();

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly displayName = signal(this.initialUser?.displayName ?? '');
  readonly username = signal(this.initialUser?.username ?? '');
  readonly avatarUrl = signal(this.initialUser?.avatarUrl ?? '');
  readonly bio = signal(this.initialUser?.bio ?? '');
  readonly location = signal(this.initialUser?.location ?? '');
  readonly instagram = signal(this.initialUser?.links.find((link) => link.label === 'Instagram')?.url ?? '');
  readonly website = signal(this.initialUser?.links.find((link) => link.label === 'Sitio web')?.url ?? '');
  readonly avatarError = signal('');
  readonly saved = signal(false);
  readonly portfolioLink = computed(() => ['/u', this.username()]);

  setUsername(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    this.username.set(value);
    input.value = value;
    this.saved.set(false);
  }

  selectAvatar(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.avatarError.set('');
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      this.avatarError.set('Elige una imagen de hasta 5 MB.');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const side = Math.min(image.naturalWidth, image.naturalHeight, 512);
        const canvas = document.createElement('canvas');
        canvas.width = side;
        canvas.height = side;
        const context = canvas.getContext('2d');
        if (!context) {
          this.avatarError.set('No se pudo procesar la imagen.');
          return;
        }
        const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
        const x = (image.naturalWidth - cropSize) / 2;
        const y = (image.naturalHeight - cropSize) / 2;
        context.drawImage(image, x, y, cropSize, cropSize, 0, 0, side, side);
        this.avatarUrl.set(canvas.toDataURL('image/jpeg', 0.82));
        this.saved.set(false);
      };
      image.onerror = () => this.avatarError.set('No se pudo abrir esta imagen.');
      image.src = reader.result as string;
    };
    reader.onerror = () => this.avatarError.set('No se pudo leer el archivo.');
    reader.readAsDataURL(file);
  }

  save(event: Event): void {
    event.preventDefault();
    const currentUser = this.auth.currentUser();
    const displayName = this.displayName().trim();
    const username = this.username().trim();
    if (!currentUser || !displayName || username.length < 3) {
      return;
    }
    const links: UserLink[] = [
      ...(this.instagram().trim() ? [{ label: 'Instagram', url: this.instagram().trim() }] : []),
      ...(this.website().trim() ? [{ label: 'Sitio web', url: this.website().trim() }] : []),
    ];
    this.auth.updateProfile({
      displayName,
      username,
      avatarUrl: this.avatarUrl(),
      bio: this.bio().trim(),
      location: this.location().trim(),
      links,
    });
    if (currentUser.displayName !== displayName) {
      this.photos.renameAuthor(currentUser.displayName, displayName);
    }
    this.saved.set(true);
  }

  login(): void {
    void this.auth.login();
  }
}