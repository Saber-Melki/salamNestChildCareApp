import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthServiceModule } from './auth-service.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const logger = new Logger('AuthServiceBootstrap');


  // HTTP app (so we can hit /, /auth/test-email, etc.)
  const app = await NestFactory.create(AuthServiceModule, { cors: true });
  const config = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Attach RMQ microservice (optional)
  const rabbitUrl = config.get<string>('RABBITMQ_URL');
  if (rabbitUrl) {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: { urls: [rabbitUrl], queue: 'auth_queue', queueOptions: { durable: false } },
    });
    await app.startAllMicroservices();
    logger.log(`✅ RMQ connected: ${rabbitUrl} (queue: auth_queue)`);
  }

   const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth Service')
    .setDescription('HTTP facade over Auth microservice to test via Swagger')
    .setVersion('1.0')
    .addBearerAuth() // for /auth/logout (access token)
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDoc);

  const port = Number(config.get('AUTH_SERVICE_PORT') ?? 3002);
  console.log('AUTH_SERVICE_PORT=', process.env.AUTH_SERVICE_PORT); // sanity
  await app.listen(port, '0.0.0.0');
  logger.log(`✅ HTTP ready on http://127.0.0.1:${port}`);

  

  app.enableShutdownHooks();
}
bootstrap();
