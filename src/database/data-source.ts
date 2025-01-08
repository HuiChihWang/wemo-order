import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { dataConfigFactory } from './data-config-factory';

dotenv.config();
const configService = new ConfigService();

export const AppDataSource = new DataSource(dataConfigFactory(configService));
