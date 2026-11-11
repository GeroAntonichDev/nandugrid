import { NgClass } from '@angular/common';
import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Conversation, Message } from '../../core/models/message.model';
import { User } from '../../core/models/user.model';
import { AuthMockService } from '../../core/services/auth-mock.service';
import { MessagingMockService } from '../../core/services/messaging-mock.service';
import { UserMockService } from '../../core/services/user-mock.service';
import { LoginWallComponent } from '../../shared/components/login-wall/login-wall.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [NgClass, RouterLink, LoginWallComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isAuthenticated()) {
      <section class="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
        <header>
          <p class="text-[11px] font-medium uppercase tracking-[0.3em] text-accent-400">Mensajes</p>
          <h1 class="mt-2 font-display text-3xl font-semibold text-white">Conversaciones</h1>
          <p class="mt-2 max-w-lg text-sm text-neutral-400">
            Coordiná con fotógrafos y clientes sin salir de ÑanduGrid.
          </p>
        </header>

        <div class="mt-6 grid overflow-hidden rounded-3xl border border-ink-800 bg-ink-900 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside class="border-b border-ink-800 lg:border-b-0 lg:border-r">
            <div class="border-b border-ink-800 px-4 py-3">
              <p class="text-[11px] uppercase tracking-[0.2em] text-neutral-500">Bandeja</p>
            </div>
            <div class="max-h-[65vh] overflow-y-auto">
              @for (conversation of conversations(); track conversation.id) {
                <button
                  type="button"
                  class="flex w-full items-center gap-3 border-b border-white/5 p-4 text-left transition hover:bg-white/5"
                  [ngClass]="
                    conversation.id === activeConversation()?.id ? 'bg-white/[0.06]' : ''
                  "
                  [attr.aria-current]="conversation.id === activeConversation()?.id ? 'true' : null"
                  (click)="select(conversation)"
                >
                  @if (otherUser(conversation); as user) {
                    @if (user.avatarUrl) {
                      <img
                        [src]="user.avatarUrl"
                        [alt]="'Foto de ' + user.displayName"
                        class="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                      />
                    } @else {
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-700 text-xs text-white">
                        {{ initials(user.displayName) }}
                      </div>
                    }
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-medium text-white">{{ user.displayName }}</p>
                      <p class="truncate text-xs text-neutral-500">{{ lastMessageText(conversation) }}</p>
                    </div>
                  }
                  @if (unreadFor(conversation); as unread) {
                    <span class="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1.5 text-[10px] font-semibold text-ink-950">
                      {{ unread }}
                    </span>
                  }
                </button>
              } @empty {
                <div class="p-6 text-center">
                  <p class="text-sm text-neutral-400">No tenés conversaciones todavía.</p>
                  <a routerLink="/marketplace" class="mt-2 inline-flex text-xs text-accent-300 hover:text-accent-200">
                    Explorar fotógrafos
                  </a>
                </div>
              }
            </div>
          </aside>

          <div class="flex min-h-[65vh] flex-col">
            @if (activeConversation(); as conversation) {
              @if (otherUser(conversation); as user) {
                <header class="flex items-center gap-3 border-b border-ink-800 p-4">
                  @if (user.avatarUrl) {
                    <img
                      [src]="user.avatarUrl"
                      [alt]="'Foto de ' + user.displayName"
                      class="h-9 w-9 rounded-full object-cover ring-1 ring-white/10"
                    />
                  } @else {
                    <div class="flex h-9 w-9 items-center justify-center rounded-full bg-accent-700 text-xs text-white">
                      {{ initials(user.displayName) }}
                    </div>
                  }
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-white">{{ user.displayName }}</p>
                    <p class="truncate text-[11px] text-neutral-500">&#64;{{ user.username }}</p>
                  </div>
                  <a [routerLink]="['/u', user.username]" class="btn-secondary px-3 py-2 text-xs">
                    Ver perfil
                  </a>
                </header>

                <div #messageList class="flex-1 space-y-3 overflow-y-auto p-4">
                  @for (message of messages(); track message.id) {
                    <div [class]="messageRowClass(message)">
                      <div [class]="messageBubbleClass(message)">
                        <p class="whitespace-pre-line text-sm">{{ message.text }}</p>
                        <p class="mt-1 text-right text-[10px] opacity-60">
                          {{ formatTime(message.createdAt) }}
                        </p>
                      </div>
                    </div>
                  } @empty {
                    <p class="py-10 text-center text-sm text-neutral-500">
                      Todavía no hay mensajes. Escribí el primero.
                    </p>
                  }
                </div>

                <div class="border-t border-ink-800 p-4">
                  <div class="flex items-end gap-2">
                    <textarea
                      rows="1"
                      class="input resize-none"
                      placeholder="Escribí un mensaje..."
                      aria-label="Escribí un mensaje"
                      [value]="draft()"
                      (input)="draft.set($any($event.target).value)"
                      (keydown.enter)="onEnter($event)"
                    ></textarea>
                    <button
                      type="button"
                      class="btn-accent px-4 py-2.5"
                      [disabled]="!draft().trim()"
                      (click)="send()"
                    >
                      Enviar
                    </button>
                  </div>
                  <p class="mt-1 text-[10px] text-neutral-600">Enter envía · Shift+Enter salta de línea.</p>
                </div>
              }
            } @else {
              <div class="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <p class="font-display text-lg font-medium text-white">Elegí una conversación</p>
                <p class="mt-2 max-w-xs text-sm text-neutral-400">
                  Seleccioná un contacto de la bandeja o iniciá un mensaje desde un portafolio.
                </p>
              </div>
            }
          </div>
        </div>
      </section>
    } @else {
      <app-login-wall
        variant="page"
        title="Inicia sesión para ver tus mensajes"
        message="Las conversaciones privadas solo son visibles para sus participantes."
        actionLabel="Entrar en modo demostración"
      />
    }
  `,
})
export class MessagesComponent implements AfterViewChecked {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthMockService);
  private readonly users = inject(UserMockService);
  private readonly messaging = inject(MessagingMockService);

  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly messageList = viewChild<ElementRef<HTMLDivElement>>('messageList');

  readonly currentUser = this.auth.currentUser;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly draft = signal('');
  readonly selectedId = signal<string | null>(null);

  readonly conversations = computed(() => {
    const id = this.currentUser()?.id;
    return id ? this.messaging.byUser(id) : [];
  });
  readonly activeConversation = computed(() => {
    const list = this.conversations();
    return list.find((conversation) => conversation.id === this.selectedId()) ?? list[0] ?? null;
  });
  readonly messages = computed(() => {
    const conversation = this.activeConversation();
    return conversation ? this.messaging.messagesFor(conversation.id) : [];
  });

  private lastConversationId: string | null = null;
  private lastMessageCount = 0;

  constructor() {
    effect(() => {
      const username = this.queryParams().get('with');
      const current = this.currentUser();
      if (!username || !current) {
        return;
      }
      const other = this.users.byUsername(username);
      if (!other || other.id === current.id) {
        return;
      }
      const conversation = this.messaging.conversationBetween(current.id, other.id);
      this.selectedId.set(conversation.id);
      this.messaging.markRead(conversation.id, current.id);
    });
  }

  ngAfterViewChecked(): void {
    const conversation = this.activeConversation();
    const count = this.messages().length;
    if (conversation?.id !== this.lastConversationId || count !== this.lastMessageCount) {
      this.lastConversationId = conversation?.id ?? null;
      this.lastMessageCount = count;
      const element = this.messageList()?.nativeElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }
  }

  otherUser(conversation: Conversation): User | undefined {
    const current = this.currentUser();
    if (!current) {
      return undefined;
    }
    return this.users.byId(this.messaging.otherParticipant(conversation, current.id));
  }

  lastMessageText(conversation: Conversation): string {
    return this.messaging.lastMessage(conversation.id)?.text ?? 'Sin mensajes todavía';
  }

  unreadFor(conversation: Conversation): number {
    const current = this.currentUser();
    return current ? this.messaging.unreadForConversation(conversation.id, current.id) : 0;
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  select(conversation: Conversation): void {
    this.selectedId.set(conversation.id);
    const current = this.currentUser();
    if (current) {
      this.messaging.markRead(conversation.id, current.id);
    }
  }

  send(): void {
    const current = this.currentUser();
    const conversation = this.activeConversation();
    const text = this.draft().trim();
    if (!current || !conversation || !text) {
      return;
    }
    this.messaging.send(conversation.id, current.id, text);
    this.messaging.markRead(conversation.id, current.id);
    this.draft.set('');
  }

  onEnter(event: Event): void {
    const keyboard = event as KeyboardEvent;
    if (keyboard.shiftKey) {
      return;
    }
    keyboard.preventDefault();
    this.send();
  }

  formatTime(isoDate: string): string {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit' });
  }

  messageRowClass(message: Message): string {
    return message.senderId === this.currentUser()?.id ? 'flex justify-end' : 'flex justify-start';
  }

  messageBubbleClass(message: Message): string {
    const base = 'max-w-[80%] rounded-2xl px-4 py-2.5';
    return message.senderId === this.currentUser()?.id
      ? `${base} bg-accent-500 text-ink-950`
      : `${base} bg-ink-800 text-neutral-100`;
  }
}
