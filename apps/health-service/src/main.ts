import { NestFactory } from '@nestjs/core';
import { HealthServiceModule } from './health-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(HealthServiceModule);

  const configService = app.get(ConfigService);

  // 🎯 Connexion au microservice RMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672'],
      queue: 'health_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // 🎯 Swagger config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Health Service')
    .setDescription('API for managing health records and notes')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  console.log('🚀 Health-service is listening on RabbitMQ health_queue');


}
bootstrap();