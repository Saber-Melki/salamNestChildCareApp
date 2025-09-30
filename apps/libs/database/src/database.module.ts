import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    return TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const baseConfig: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
        };

        const sslConfig = {};
        const useSsl = configService.get<string>('DB_SSL') === 'true';

        if (useSsl) {
          const caPath = configService.get<string>('DB_CA_PATH');
          const fullCaPath = path.join(process.cwd(), caPath || '');

          const sslOptions = {};

          if (caPath && fs.existsSync(fullCaPath)) {
            sslOptions['ca'] = fs.readFileSync(fullCaPath).toString();
            console.log(`✅ DatabaseModule: SSL enabled using CA certificate.`);
          } else {
            sslOptions['rejectUnauthorized'] = false;
            console.warn(
              `⚠️ DatabaseModule: DB_CA_PATH not found. Falling back to insecure SSL.`,
            );
          }

          sslConfig['extra'] = {
            ssl: sslOptions,
          };
        }

        return {
          ...baseConfig,
          ...sslConfig,
        };
      },
    });
  }
}
