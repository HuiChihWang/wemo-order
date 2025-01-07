import { CurrencyCode } from '../../payment/enum/currency.enum';

export interface PayOrderResult {
  orderNo: string;
  userId: number;
  payAt: Date;
  amount: number;
  currency: CurrencyCode;
  status: 'SUCCESS' | 'FAILED';
}
