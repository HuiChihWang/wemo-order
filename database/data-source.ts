import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

dotenv.config();

const configService = new ConfigService();
const migrationDir = __dirname + '/migrations/*{.ts,.js}';
const entitiesDir = __dirname + '/../src/**/*.entity{.ts,.js}';

const dbConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [entitiesDir],
  synchronize: false,
  migrations: [migrationDir],
};

export const AppDataSource = new DataSource(dbConfig);
