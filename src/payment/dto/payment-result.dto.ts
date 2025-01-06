import { CurrencyCode } from '../enum/currency.enum';

export class PaymentResult {
  amount: number;
  currency: CurrencyCode;

  constructor(amount: number, currency: CurrencyCode) {
    this.amount = amount;
    this.currency = currency;
  }
}
