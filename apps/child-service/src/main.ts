import { NestFactory } from '@nestjs/core';
import { ChildServiceModule } from './child-service.module'; // <-- ton vrai module
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // On démarre le vrai module de ton microservice
  const app = await NestFactory.create(ChildServiceModule);

  const configService = app.get(ConfigService);

  // Configurer le microservice RMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672',
      ],
      queue: 'child_queue', // 👈 doit matcher avec api-gateway
      queueOptions: {
        durable: false,
      },
    },
  });

  // Swagger (uniquement si tu veux exposer REST aussi)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Child Service')
    .setDescription('API for managing children')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  console.log('🚀 Child-service is listening on RabbitMQ child_queue');
}
bootstrap();
