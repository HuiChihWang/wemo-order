import { Injectable } from '@nestjs/common';
import { PaymentData } from '../dto/payment.data';
import { PaymentResult } from '../dto/payment-result.dto';

@Injectable()
export class PaymentService {
  public async pay(data: PaymentData): Promise<PaymentResult> {
    return {
      currency: data.currency,
      amount: data.amount,
    };
  }
}
