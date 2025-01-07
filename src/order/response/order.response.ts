import { Order } from '../entity/order.entity';
import { OrderStatus } from '../enum/order-status.enum';

export class OrderResponse {
  rentingHistoryId: number;
  userId: number;
  orderNo: string;
  amount: number;
  status: OrderStatus;
  createdAt: Date;

  constructor(
    rentingHistoryId: number,
    userId: number,
    amount: number,
    status: OrderStatus,
    orderNo: string,
    createdAt: Date,
  ) {
    this.rentingHistoryId = rentingHistoryId;
    this.userId = userId;
    this.amount = amount;
    this.status = status;
    this.createdAt = createdAt;
    this.orderNo = orderNo;
  }

  public static fromEntity(order: Order): OrderResponse {
    return new OrderResponse(
      order.rentingHistoryId,
      order.userId,
      order.amount,
      order.status,
      order.orderNo,
      order.createdAt,
    );
  }
}
