import { Module } from '@nestjs/common';
import { PaymentService } from './service/payment.service';

@Module({
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
