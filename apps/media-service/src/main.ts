import { NestFactory } from '@nestjs/core';
import { MediaServiceModule } from './media-service.module'; // <-- ton vrai module
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';


async function bootstrap() {
  // On démarre le vrai module de ton microservice
  const app = await NestFactory.create(MediaServiceModule);

  const configService = app.get(ConfigService);

  // Configurer le microservice RMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672',
      ],
      queue: 'media_queue', // 👈 doit matcher avec api-gateway
      queueOptions: {
        durable: false,
      },
    },
  });

  // Swagger (uniquement si tu veux exposer REST aussi)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Media Service')
    .setDescription('API for managing albums and media items')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  console.log('🚀 Media-service is listening on RabbitMQ media_queue');

  // rendre le dossier uploads accessible en public
  (app as any).useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // accessible via http://localhost:8080/uploads/filename.png
  });
}
bootstrap();
