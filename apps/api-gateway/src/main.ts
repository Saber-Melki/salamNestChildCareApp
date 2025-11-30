import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express'; // 👈 important

async function bootstrap() {
  // 👇 tell Nest we are using the Express platform
  const app = await NestFactory.create<NestExpressApplication>(ApiGatewayModule);

  // Middleware
  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:5173', // frontend URL
    credentials: true,
  });

  // 👇 expose the /uploads folder where Multer stores files
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads', // → http://localhost:8080/uploads/<filename>
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
      import('chalk'),
      import('boxen'),
    ]);

    const message = `
${chalk.blue.bold('🚀 SalamNest API Gateway')}
${chalk.greenBright('✅ Running on:')} ${chalk.yellow(`http://localhost:${port}`)}
${chalk.greenBright('📖 Swagger docs:')} ${chalk.cyan(`http://localhost:${port}/api/docs`)}

${chalk.magentaBright('✨ Enjoy while building an amazing childcare app! ✨')}
`;

    console.log(
      boxen(message, {
        padding: 1,
        margin: 1,
        borderColor: 'cyan',
        borderStyle: 'round',
      }),
    );
  } catch {
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
