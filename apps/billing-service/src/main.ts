import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { BillingModule } from './billing-service.module';

async function bootstrap() {
  const app = await NestFactory.create(BillingModule);
  const configService = app.get(ConfigService);

  // 🧠 Stripe needs raw body for webhook signature verification
  app.use(
    '/billing/pay/stripe/webhook',
    // no urlencoded here, just raw JSON
    json({
      verify: (req: any, res, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );

  // Normal JSON for other routes
  app.use(
    json(),
  );
  app.use(
    urlencoded({ extended: true }),
  );

  // 🎯 Connect RMQ microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        configService.get<string>('RABBITMQ_URL') ||
          'amqp://localhost:5672',
      ],
      queue: 'billing_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // 📚 Swagger for HTTP API (includes PaymentController)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Billing Service')
    .setDescription('API for managing invoices and payments (Stripe)')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  console.log('🚀 Billing-service is listening on RabbitMQ billing_queue');

  const port = Number(process.env.BILLING_HTTP_PORT ?? 3002);
  await app.listen(port);
  console.log(`🌐 Billing-service HTTP API on http://localhost:${port}`);
  console.log(`📖 Swagger UI on http://localhost:${port}/api`);
}

bootstrap();
