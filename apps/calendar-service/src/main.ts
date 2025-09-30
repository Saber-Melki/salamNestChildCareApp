import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CalendarModule } from './calendar-service.module';

async function bootstrap() {
  // 🌐 Créer l'app HTTP pour Swagger
  const app = await NestFactory.create(CalendarModule);

  // 🎯 Swagger config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Calendar Service')
    .setDescription('API for managing center events')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // 🚀 Connect microservice RMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'calendar_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices(); // démarrer RMQawait app.listen(8080);            
  console.log('🚀 Calendar-service listening on HTTP 8080 & RabbitMQ queue: calendar_queue');
}

bootstrap();
