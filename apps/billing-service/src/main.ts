import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BillingModule } from './billing-service.module';

async function bootstrap() {
  const app = await NestFactory.create(BillingModule);
  const configService = app.get(ConfigService);

  // 🎯 Connexion au microservice RMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672'],
      queue: 'billing_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // 🎯 Swagger config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Billing Service')
    .setDescription('API for managing invoices and payments')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  console.log('🚀 Billing-service is listening on RabbitMQ billing_queue');
}

bootstrap();