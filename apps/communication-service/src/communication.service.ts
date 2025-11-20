// apps/communication-service/src/communication.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

type Priority = 'high' | 'normal' | 'low';
type MsgType = 'text' | 'image' | 'file' | 'audio';
type MsgStatus = 'sent' | 'delivered' | 'read';

export interface Thread {
  id: string;
  participants: string[]; // e.g. ["18", "20"]
  family?: string;        // Display name on the left panel
  childName?: string;
  last: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isPinned?: boolean;
  isMuted?: boolean;
  priority?: Priority;

  // 👇 extra fields for frontend convenience
  otherUserId?: string;
  otherUserName?: string;
}

export interface Message {
  id: string;
  threadId: string;
  fromUserId: string;
  text: string;
  time: string;
  status?: MsgStatus;
  type?: MsgType;
  isImportant?: boolean;
}

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);

  // Very simple in-memory store for now
  private threads: Thread[] = [];
  private messages: Message[] = [];

  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  // --------- NAME HELPERS ---------

  /**
   * Build a nice name out of an email:
   * "yasmine.ali@example.com" → "Yasmine Ali"
   */
  private buildNameFromEmail(email: string | undefined): string | undefined {
    if (!email) return undefined;

    const [local] = email.split('@'); // "yasmine.ali"
    if (!local) return undefined;

    const parts = local.split(/[.\-_]+/).filter(Boolean); // ['yasmine','ali']
    if (parts.length === 0) return undefined;

    return parts
      .map(
        (p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(),
      )
      .join(' '); // "Yasmine Ali"
  }

  /**
   * Resolve a user name from USER_SERVICE.
   * - Try firstName/lastName/name/fullName/displayName
   * - If that looks like an email → prettify it
   * - Otherwise, derive from email
   */
  private async resolveUserName(userId: string): Promise<string | undefined> {
    if (!userId) return undefined;

    try {
      const user: any = await firstValueFrom(
        this.userClient.send({ cmd: 'get_user' }, userId),
      );

      if (!user) return undefined;

      const fullName = [user.firstName, user.lastName]
        .filter(
          (p) => typeof p === 'string' && p.trim().length > 0,
        )
        .join(' ')
        .trim();

      // Raw candidate from typical name fields
      const rawCandidate: string | undefined =
        (typeof user.name === 'string' && user.name.trim()) ||
        (typeof user.fullName === 'string' && user.fullName.trim()) ||
        (typeof user.displayName === 'string' &&
          user.displayName.trim()) ||
        (fullName.length > 0 ? fullName : undefined);

      let pretty: string | undefined = rawCandidate;

      // If candidate is missing OR looks like an email -> use email to build a nice name
      if (!pretty || pretty.includes('@')) {
        const fromEmail = this.buildNameFromEmail(
          user.email ?? pretty,
        );
        if (fromEmail) {
          pretty = fromEmail;
        }
      }

      if (pretty) {
        return pretty;
      }

      // Last fallback: try to build from email directly
      const emailName = this.buildNameFromEmail(user.email);
      return emailName ?? undefined;
    } catch (e: any) {
      this.logger.warn(
        `[communication-service] Failed to resolve user name for ${userId}: ${e?.message}`,
      );
      return undefined;
    }
  }

  // -------- THREADS ----------

  /**
   * Returns all threads where the given user participates.
   * Used by GET /messages/threads (gateway).
   */
  async listThreadsForUser(payload: {
    userId: string | number;
  }): Promise<Thread[]> {
    const rawId = payload?.userId;
    const userId = String(rawId ?? '').trim();

    if (!userId || userId === 'NaN' || userId === 'undefined') {
      this.logger.warn(
        `listThreadsForUser called with invalid userId="${rawId}"`,
      );
      return [];
    }

    this.logger.log(
      `[communication-service] listThreadsForUser ${userId}`,
    );

    // Filter by participants
    const forUser = this.threads.filter((t) =>
      t.participants.includes(userId),
    );

    // Enrich each thread with otherUserName & clean family
    const enriched: Thread[] = await Promise.all(
      forUser.map(async (t) => {
        const otherId =
          t.participants.find((p) => p !== userId) ?? userId;

        const resolvedName = await this.resolveUserName(otherId);

        const displayName =
          resolvedName || t.family || 'Conversation';

        return {
          ...t,
          family: displayName,
          otherUserId: otherId,
          otherUserName: displayName,
        };
      }),
    );

    // Sort most recent first
    enriched.sort((a, b) => {
      const ta = a.lastMessageTime
        ? Date.parse(a.lastMessageTime)
        : 0;
      const tb = b.lastMessageTime
        ? Date.parse(b.lastMessageTime)
        : 0;
      return tb - ta;
    });

    return enriched;
  }

  // -------- MESSAGES ----------

  /**
   * List all messages in a given thread.
   * Used by GET /messages/:threadId (gateway).
   */
  async getThreadMessages(
    threadId: string,
    userId: string | number,
  ): Promise<Message[]> {
    const uid = String(userId ?? '').trim();
    this.logger.log(
      `[communication-service] getThreadMessages threadId=${threadId} userId=${uid}`,
    );

    // (optional) verify that the user is participant of the thread here
    return this.messages.filter((m) => m.threadId === threadId);
  }

  /**
   * Send a message in a thread.
   * Used by POST /messages (gateway).
   */
  async sendMessage(params: {
    threadId: string;
    text: string;
    type?: MsgType;
    senderId: string | number;
  }): Promise<Message> {
    const senderId = String(params.senderId ?? '').trim();

    this.logger.log(
      `[communication-service] sendMessage threadId=${params.threadId} from=${senderId}`,
    );

    const now = new Date();

    const msg: Message = {
      id: `m_${now.getTime()}`,
      threadId: params.threadId,
      fromUserId: senderId,
      text: params.text,
      time: now.toLocaleTimeString(),
      status: 'sent',
      type: params.type ?? 'text',
    };

    this.messages.push(msg);

    // Find or create the thread
    let thread = this.threads.find(
      (t) => t.id === params.threadId,
    );

    if (!thread) {
      // Minimal thread when first message arrives
      thread = {
        id: params.threadId,
        participants: [senderId],
        last: params.text,
        lastMessageTime: now.toISOString(),
        unreadCount: 0,
        priority: 'normal',
      };
      this.threads.push(thread);
    } else {
      thread.last = params.text;
      thread.lastMessageTime = now.toISOString();
      // You could increase unreadCount for the *other* participant here later
    }

    // Ensure sender is always in participants
    if (!thread.participants.includes(senderId)) {
      thread.participants.push(senderId);
    }

    return msg;
  }

  // -------- DM THREAD CREATION ----------

  async getOrCreateDmThread(
    userId: string,
    targetUserId: string,
  ): Promise<Thread> {
    const uid = userId.trim();
    const tid = targetUserId.trim();

    // Look for an existing DM between these two users
    let thread = this.threads.find(
      (t) =>
        t.participants.length === 2 &&
        t.participants.includes(uid) &&
        t.participants.includes(tid),
    );

    if (!thread) {
      const now = new Date();
      thread = {
        id: `t_${now.getTime()}`,
        participants: [uid, tid],
        family: 'Conversation', // will be overwritten by resolveUserName in listThreadsForUser
        last: '',
        lastMessageTime: now.toISOString(),
        unreadCount: 0,
        priority: 'normal',
      };
      this.threads.push(thread);
    }

    return thread;
  }
}
