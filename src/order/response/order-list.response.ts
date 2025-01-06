import { OrderResponse } from './order.response';
import { Order } from '../entity/order.entity';

export class OrderListResponse {
  total: number;
  orders: OrderResponse[];

  constructor(total: number, orders: OrderResponse[]) {
    this.total = total;
    this.orders = orders;
  }

  public static fromEntities(orders: Order[]): OrderListResponse {
    return new OrderListResponse(
      orders.length,
      orders.map((order) => OrderResponse.fromEntity(order)),
    );
  }
}
