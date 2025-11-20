import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

  console.log('[communication-service] Bootstrapping…');
  console.log('[communication-service] RABBITMQ_URL =', rabbitUrl);
  console.log('[communication-service] Queue       = communication_queue');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: 'communication_queue', // 👈 MUST match Api-Gateway client
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  try {
    await app.listen();
    console.log(
      '🚀 [communication-service] Microservice is running and listening on RMQ queue "communication_queue"',
    );
  } catch (err) {
    console.error(
      '[communication-service] ❌ Failed to start microservice. Check RabbitMQ URL / connection.',
    );
    console.error(err);
  }
}

bootstrap();
