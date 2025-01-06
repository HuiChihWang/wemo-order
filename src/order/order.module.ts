import { Module } from '@nestjs/common';
import { OrderService } from './service/order.service';
import { PaymentModule } from '../payment/payment.module';
import { OrderRepository } from './repository/order.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderController } from './controller/order.controller';

@Module({
  imports: [PaymentModule, TypeOrmModule.forFeature([Order])],
  providers: [OrderService, OrderRepository],
  controllers: [OrderController],
})
export class OrderModule {}
