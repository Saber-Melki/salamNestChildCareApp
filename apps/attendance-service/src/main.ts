import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AttendanceModule } from './attendance-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AttendanceModule);
  const configService = app.get(ConfigService);

  // Microservice RMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672'],
      queue: 'attendance_queue',
      queueOptions: { durable: false },
    },
  });

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Attendance Service')
    .setDescription('API for managing attendance')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Démarrer microservice RMQ
  await app.startAllMicroservices();
  console.log('🚀 Attendance-service is listening on RabbitMQ attendance_queue');

  // Démarrer HTTP (Swagger)
  
}
bootstrap();

