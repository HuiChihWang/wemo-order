import { CurrencyCode } from '../../payment/enum/currency.enum';
import { PayOrderResult } from '../dto/pay-order-result.dto';

export class PayOrderResponse {
  orderNo: string;
  payAt: Date;
  totalPrice: number;
  currency: CurrencyCode;
  status: string;

  constructor(
    orderNo: string,
    payAt: Date,
    totalPrice: number,
    currency: CurrencyCode,
    status: string,
  ) {
    this.orderNo = orderNo;
    this.payAt = payAt;
    this.totalPrice = totalPrice;
    this.currency = currency;
    this.status = status;
  }

  public static from(data: PayOrderResult): PayOrderResponse {
    return new PayOrderResponse(
      data.orderNo,
      data.payAt,
      data.amount,
      data.currency,
      data.status,
    );
  }
}
