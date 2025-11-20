// apps/api-gateway/src/communication/messages.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface WsUser {
  userId: string;
  role?: string;
  email?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // your React dev URL
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // --- Connection handling with JWT auth ---
  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth as any)?.token ||
        (client.handshake.headers['authorization'] as string | undefined)?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('WS connection rejected: no token');
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const payload: any = this.jwtService.verify(token, { secret });

      const user: WsUser = {
        userId: String(payload.userid ?? payload.sub ?? ''),
        role: payload.role ?? undefined,
        email: payload.email ?? undefined,
      };

      if (!user.userId) {
        this.logger.warn('WS connection rejected: invalid payload (no userId)');
        client.disconnect();
        return;
      }

      client.data.user = user;
      this.logger.log(`WS client connected: userId=${user.userId}`);
    } catch (e) {
      this.logger.warn(`WS connection error: ${e?.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user: WsUser | undefined = client.data.user;
    this.logger.log(`WS client disconnected: userId=${user?.userId ?? 'unknown'}`);
  }

  // --- Client asks to join a thread room ---
  @SubscribeMessage('thread:join')
  handleJoinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const user: WsUser | undefined = client.data.user;
    if (!user) {
      client.disconnect();
      return;
    }

    const room = `thread:${data.threadId}`;
    client.join(room);
    this.logger.log(`userId=${user.userId} joined room ${room}`);

    client.emit('thread:joined', { threadId: data.threadId });
  }

  // --- Client can leave a thread explicitly (optional) ---
  @SubscribeMessage('thread:leave')
  handleLeaveThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { threadId: string },
  ) {
    const room = `thread:${data.threadId}`;
    client.leave(room);
    this.logger.log(`socket left room ${room}`);
    client.emit('thread:left', { threadId: data.threadId });
  }

  // --- Method used by HTTP controller to broadcast a new message ---
  emitMessageToThread(message: any) {
    // we assume message has a threadId property
    const room = `thread:${message.threadId}`;
    this.logger.log(`Broadcasting message ${message.id} to room ${room}`);
    this.server.to(room).emit('message:new', message);
  }
}
