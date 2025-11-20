import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // Middleware
  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:5173', // frontend URL
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API documentation for SalamNest childcare app microservices')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = 8080;
  await app.listen(port);

  // ---- Pretty console output (ESM-safe) ----
  try {
    const [{ default: chalk }, { default: boxen }] = await Promise.all([
      import('chalk'), // ESM
      import('boxen'), // ESM
    ]);

    const message = `
${chalk.blue.bold('🚀 SalamNest API Gateway')}
${chalk.greenBright('✅ Running on:')} ${chalk.yellow(`http://localhost:${port}`)}
${chalk.greenBright('📖 Swagger docs:')} ${chalk.cyan(`http://localhost:${port}/api/docs`)}

${chalk.magentaBright('✨ Enjoy while building an amazing childcare app! ✨')}
`;

    // eslint-disable-next-line no-console
    console.log(
      boxen(message, {
        padding: 1,
        margin: 1,
        borderColor: 'cyan',
        borderStyle: 'round',
      }),
    );
  } catch (e) {
    // Fallback if chalk/boxen aren’t available or fail to import
    // eslint-disable-next-line no-console
    console.log(
      [
        '🚀 SalamNest API Gateway',
        `✅ Running on: http://localhost:${port}`,
        `📖 Swagger docs: http://localhost:${port}/api/docs`,
        '✨ Enjoy while building an amazing childcare app! ✨',
      ].join('\n'),
    );
  }
}

bootstrap();
