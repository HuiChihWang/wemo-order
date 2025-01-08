import { ConfigService } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const dataConfigFactory = (
  config: ConfigService,
): PostgresConnectionOptions => ({
  type: 'postgres',
  host: config.get<string>('DB_HOST'),
  port: config.get<number>('DB_PORT'),
  username: config.get<string>('DB_USER'),
  password: config.get<string>('DB_PASSWORD'),
  database: config.get<string>('DB_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsRun: true,
  synchronize: false,
});
