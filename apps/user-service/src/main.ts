import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './user-service.module'; // Make sure this imports your main AppModule
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);
  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');

  if (!rabbitmqUrl) {
    throw new Error(
      'FATAL: RABBITMQ_URL not found in environment variables. Check your .env file.',
    );
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'user_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  app.useGlobalPipes(new ValidationPipe());

  await app.listen();
  console.log(
    '✅ User microservice is listening for messages on the "user_queue"',
  );

  await appContext.close();
}
bootstrap();
