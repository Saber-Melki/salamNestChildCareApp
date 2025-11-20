import { NestFactory } from '@nestjs/core';
import { StaffServiceModule } from './staff-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Démarre le vrai module du microservice staff
  const app = await NestFactory.create(StaffServiceModule);

  const configService = app.get(ConfigService);

  // Configurer le microservice RMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672',
      ],
      queue: 'staff_queue', // 👈 doit matcher avec api-gateway
      queueOptions: {
        durable: false,
      },
    },
  });

  // Swagger (optionnel si REST aussi)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Staff Service')
    .setDescription('API for managing staff')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  console.log('🚀 Staff-service is listening on RabbitMQ staff_queue');
}
bootstrap();
