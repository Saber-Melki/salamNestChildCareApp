import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { StaffServiceModule } from './staff-service.module';

async function bootstrap() {
  const app = await NestFactory.create(StaffServiceModule);

  const configService = app.get(ConfigService);

  // 🎯 Connexion au microservice RMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672'],
      queue: 'staff_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // 🎯 Swagger config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Staff Service')
    .setDescription('API for managing staff shifts')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  console.log('🚀 Staff-service is listening on RabbitMQ staff_queue');
}
bootstrap();