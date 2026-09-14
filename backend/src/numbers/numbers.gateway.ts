// numbers.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { NumbersService } from './numbers.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/queue',
})
export class NumbersGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NumbersGateway.name);

  constructor(
    @Inject(forwardRef(() => NumbersService))
    private readonly numbersService: NumbersService,
  ) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
    const [state, pending] = await Promise.all([
      this.numbersService.getQueueState(),
      this.numbersService.getPendingCall(),
    ]);
    client.emit('queue:state', state);
    client.emit('queue:pending-list', pending);
  }

  emitNewPendingNumber(payload: {
    id: string;
    name: string;
    cpf: string;
    type: string;
    queueNumber: string;
    createdAt: Date;
  }) {
    this.server.emit('queue:new-pending', payload);
  }

  emitPendingList(pending: any[]) {
    this.server.emit('queue:pending-list', pending);
  }

  emitQueueState(state: { current: string | null; lastCalls: string[] }) {
    this.server.emit('queue:state', state);
  }

  emitNumberCalled(payload: { queueNumber: string; type: string }) {
    this.server.emit('queue:number-called', payload);
  }
}
