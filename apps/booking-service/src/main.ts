import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BookingModule } from './booking-service.module';

async function bootstrap() {
  const app = await NestFactory.create(BookingModule);
  const configService = app.get(ConfigService);

  // 🎯 Connexion au microservice RMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672'],
      queue: 'booking_queue',
      queueOptions: { durable: false },
    },
  });

  // 🎯 Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Booking Service')
    .setDescription('API for managing parent meetings')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  console.log('🚀 Booking-service is listening on RabbitMQ booking_queue');
}

bootstrap();
