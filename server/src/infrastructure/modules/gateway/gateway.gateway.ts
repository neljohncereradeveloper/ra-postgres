import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { CastVoteReportUseCase } from '@application/use-cases/reports/cast-votes-report.use-case';
import { Inject } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust as needed for security
    credentials: true,
  },
  namespace: '/ws', // You can change the namespace if needed
})
export class GatewayGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('GatewayGateway');

  // Static instance for broadcasting
  private static instance: GatewayGateway;

  constructor(
    @Inject(CastVoteReportUseCase)
    private readonly castVoteReportUseCase: CastVoteReportUseCase,
  ) {
    GatewayGateway.instance = this;
  }

  static async broadcastLatestCastVotes() {
    if (GatewayGateway.instance) {
      try {
        const result =
          await GatewayGateway.instance.castVoteReportUseCase.execute('system');
        GatewayGateway.instance.server.emit('latest-cast-votes', result);
      } catch (error) {
        GatewayGateway.instance.logger.error(
          'Error broadcasting latest cast votes',
          error,
        );
      }
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // You can emit a welcome event or perform authentication here
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(`Received ping from ${client.id}`);
    client.emit('pong', { message: 'pong', data });
  }

  @SubscribeMessage('get-latest-cast-votes')
  async handleGetLatestCastVotes(@ConnectedSocket() client: Socket) {
    try {
      const result = await this.castVoteReportUseCase.execute('system');
      client.emit('latest-cast-votes', result);
    } catch (error) {
      this.logger.error('Error fetching latest cast votes', error);
      client.emit('latest-cast-votes-error', {
        message: error.message || 'Unknown error',
      });
    }
  }
}
