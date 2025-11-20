// apps/api-gateway/src/communication/messages.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

export interface WsUserPayload {
  userid: string;
  role: string;
}

export interface NewMessagePayload {
  id: string;
  threadId: string;
  fromUserId: string;
  fromName?: string;
  text: string;
  createdAt: string;
  type?: 'text' | 'image' | 'file' | 'audio';
  status?: 'sent' | 'delivered' | 'read';
}

/**
 * WebSocket gateway for real-time messaging.
 *
 * Namespace: /ws/messages
 * Events:
 *  - client -> server:
 *      "thread:join"  { threadId }
 *      "thread:leave" { threadId }
 *  - server -> client:
 *      "message:new"  NewMessagePayload
 */
@Injectable()
@WebSocketGateway({
  namespace: '/ws/messages',
  cors: {
    origin: 'http://localhost:5173', // your React/Vite app
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ---------------- Connection & Auth ----------------

  async handleConnection(client: Socket) {
    try {
      const user = await this.authenticateClient(client);
      client.data.user = user;

      this.logger.log(
        `WS connected: socketId=${client.id}, userId=${user.userid}, role=${user.role}`,
      );

      // Optionally emit a welcome event
      client.emit('connected', { userId: user.userid, role: user.role });
    } catch (error) {
      this.logger.warn(
        `WS connection refused for socket ${client.id}: ${(error as Error).message}`,
      );
      client.emit('error', { message: 'Unauthorized WebSocket connection' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const u: WsUserPayload | undefined = client.data?.user;
    if (u) {
      this.logger.log(
        `WS disconnected: socketId=${client.id}, userId=${u.userid}`,
      );
    } else {
      this.logger.log(`WS disconnected: socketId=${client.id}`);
    }
  }

  /**
   * Authenticate socket using JWT.
   * We expect the frontend to connect with:
   *   io("http://localhost:8080/ws/messages", {
   *     auth: { token: localStorage.getItem("accessToken") }
   *   })
   */
  private async authenticateClient(client: Socket): Promise<WsUserPayload> {
    const authToken =
      client.handshake.auth?.token ||
      client.handshake.headers['authorization']?.toString().replace('Bearer ', '');

    if (!authToken) {
      throw new UnauthorizedException('Missing auth token for WebSocket');
    }

    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    try {
      const decoded: any = this.jwtService.verify(authToken, { secret });
      // Your JWT payload structure: { userid, role }
      if (!decoded?.userid || !decoded?.role) {
        throw new UnauthorizedException('Invalid token payload');
      }

      return {
        userid: String(decoded.userid),
        role: String(decoded.role),
      };
    } catch (err) {
      this.logger.error('[MessagesGateway] JWT verify failed', err);
      throw new UnauthorizedException('Invalid WebSocket token');
    }
  }

  // ---------------- Room Management ----------------

  @SubscribeMessage('thread:join')
  handleJoinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const user: WsUserPayload | undefined = client.data?.user;
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    const room = this.getThreadRoomName(data.threadId);
    client.join(room);

    this.logger.log(
      `User ${user.userid} joined room ${room} (socket ${client.id})`,
    );

    client.emit('thread:joined', {
      threadId: data.threadId,
      room,
    });
  }

  @SubscribeMessage('thread:leave')
  handleLeaveThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const user: WsUserPayload | undefined = client.data?.user;
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    const room = this.getThreadRoomName(data.threadId);
    client.leave(room);

    this.logger.log(
      `User ${user.userid} left room ${room} (socket ${client.id})`,
    );

    client.emit('thread:left', {
      threadId: data.threadId,
      room,
    });
  }

  // ---------------- Public method for HTTP layer ----------------

  /**
   * Call this from your HTTP controller after a message is created
   * to broadcast it in real time to all clients in this thread.
   */
  public broadcastNewMessage(payload: NewMessagePayload) {
    const room = this.getThreadRoomName(payload.threadId);
    this.logger.log(
      `Broadcasting message:new to room=${room} (messageId=${payload.id})`,
    );

    this.server.to(room).emit('message:new', payload);
  }

  private getThreadRoomName(threadId: string) {
    return `thread:${threadId}`;
  }
}
