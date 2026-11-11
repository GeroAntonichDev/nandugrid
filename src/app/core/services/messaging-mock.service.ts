import { Injectable, inject, signal } from '@angular/core';
import { Conversation, Message } from '../models/message.model';
import { StorageService } from './storage.service';

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-001',
    participantIds: ['usr-001', 'usr-002'],
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-06T15:42:00.000Z',
  },
  {
    id: 'conv-002',
    participantIds: ['usr-001', 'usr-003'],
    createdAt: '2026-11-03T09:30:00.000Z',
    updatedAt: '2026-11-05T18:10:00.000Z',
  },
  {
    id: 'conv-003',
    participantIds: ['usr-001', 'usr-004'],
    createdAt: '2026-11-04T20:15:00.000Z',
    updatedAt: '2026-11-04T20:20:00.000Z',
  },
];

const SEED_MESSAGES: Message[] = [
  {
    id: 'msg-001',
    conversationId: 'conv-001',
    senderId: 'usr-002',
    text: '¡Hola! Vi que te interesó la sesión de paisaje. ¿Tenés fecha en mente?',
    createdAt: '2026-11-05T14:05:00.000Z',
    readAt: '2026-11-05T14:10:00.000Z',
  },
  {
    id: 'msg-002',
    conversationId: 'conv-001',
    senderId: 'usr-001',
    text: 'Hola Camila, sí: me gustaría algo a principios de diciembre, al amanecer.',
    createdAt: '2026-11-05T14:20:00.000Z',
    readAt: '2026-11-05T14:25:00.000Z',
  },
  {
    id: 'msg-003',
    conversationId: 'conv-001',
    senderId: 'usr-002',
    text: 'Perfecto, te paso un par de locaciones por el litoral y coordinamos.',
    createdAt: '2026-11-06T15:42:00.000Z',
  },
  {
    id: 'msg-004',
    conversationId: 'conv-002',
    senderId: 'usr-001',
    text: 'Diego, ¿seguís haciendo retratos editoriales en estudio?',
    createdAt: '2026-11-05T17:50:00.000Z',
    readAt: '2026-11-05T18:00:00.000Z',
  },
  {
    id: 'msg-005',
    conversationId: 'conv-002',
    senderId: 'usr-003',
    text: 'Sí, claro. Contame qué necesitás y armamos una propuesta.',
    createdAt: '2026-11-05T18:10:00.000Z',
  },
  {
    id: 'msg-006',
    conversationId: 'conv-003',
    senderId: 'usr-004',
    text: 'Gracias por seguir mi trabajo. Si querés, te comparto el calendario de salidas nocturnas.',
    createdAt: '2026-11-04T20:20:00.000Z',
  },
];

@Injectable({ providedIn: 'root' })
export class MessagingMockService {
  private readonly storage = inject(StorageService);

  private readonly _conversations = signal<Conversation[]>(
    this.storage.read('conversations', SEED_CONVERSATIONS),
  );
  private readonly _messages = signal<Message[]>(this.storage.read('messages', SEED_MESSAGES));

  readonly conversations = this._conversations.asReadonly();
  readonly messages = this._messages.asReadonly();

  conversationBetween(userA: string, userB: string): Conversation {
    const existing = this._conversations().find(
      (conversation) =>
        conversation.participantIds.includes(userA) &&
        conversation.participantIds.includes(userB) &&
        conversation.participantIds.length === 2,
    );
    if (existing) {
      return existing;
    }
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: globalThis.crypto?.randomUUID?.() ?? `conv-${Date.now()}`,
      participantIds: [userA, userB],
      createdAt: now,
      updatedAt: now,
    };
    this._conversations.update((conversations) => [conversation, ...conversations]);
    this.persistConversations();
    return conversation;
  }

  byUser(userId: string): Conversation[] {
    return this._conversations()
      .filter((conversation) => conversation.participantIds.includes(userId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  messagesFor(conversationId: string): Message[] {
    return this._messages()
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  lastMessage(conversationId: string): Message | undefined {
    const messages = this.messagesFor(conversationId);
    return messages[messages.length - 1];
  }

  unreadCount(userId: string): number {
    const conversationIds = new Set(this.byUser(userId).map((conversation) => conversation.id));
    return this._messages().filter(
      (message) =>
        conversationIds.has(message.conversationId) &&
        message.senderId !== userId &&
        !message.readAt,
    ).length;
  }

  unreadForConversation(conversationId: string, userId: string): number {
    return this._messages().filter(
      (message) =>
        message.conversationId === conversationId &&
        message.senderId !== userId &&
        !message.readAt,
    ).length;
  }

  send(conversationId: string, senderId: string, text: string): Message | null {
    const trimmed = text.trim();
    if (!trimmed) {
      return null;
    }
    const now = new Date().toISOString();
    const message: Message = {
      id: globalThis.crypto?.randomUUID?.() ?? `msg-${Date.now()}`,
      conversationId,
      senderId,
      text: trimmed,
      createdAt: now,
    };
    this._messages.update((messages) => [...messages, message]);
    this._conversations.update((conversations) =>
      conversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, updatedAt: now } : conversation,
      ),
    );
    this.persistMessages();
    this.persistConversations();
    return message;
  }

  markRead(conversationId: string, userId: string): void {
    const now = new Date().toISOString();
    let changed = false;
    this._messages.update((messages) =>
      messages.map((message) => {
        if (
          message.conversationId === conversationId &&
          message.senderId !== userId &&
          !message.readAt
        ) {
          changed = true;
          return { ...message, readAt: now };
        }
        return message;
      }),
    );
    if (changed) {
      this.persistMessages();
    }
  }

  otherParticipant(conversation: Conversation, userId: string): string {
    return conversation.participantIds.find((id) => id !== userId) ?? userId;
  }

  private persistConversations(): void {
    this.storage.write('conversations', this._conversations());
  }

  private persistMessages(): void {
    this.storage.write('messages', this._messages());
  }
}
