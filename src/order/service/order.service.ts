import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository } from '../repository/order.repository';
import { Order } from '../entity/order.entity';
import { PaymentService } from '../../payment/service/payment.service';
import { CurrencyCode } from '../../payment/enum/currency.enum';
import { SearchOrdersRequest } from '../request/search-orders.request';
import { OrderStatus } from '../enum/order-status.enum';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly paymentService: PaymentService,
  ) {}

  public async createOrder(
    userId: number,
    rentingId: number,
    amount: number,
  ): Promise<Order> {
    const existedOrder = await this.orderRepository.findOneBy({
      userId,
      rentingHistoryId: rentingId,
    });

    if (existedOrder) {
      throw new BadRequestException('Order already created');
    }

    return this.orderRepository.save({
      userId,
      rentingHistoryId: rentingId,
      amount,
      createdAt: new Date(),
    });
  }

  public async searchOrders(request: SearchOrdersRequest): Promise<Order[]> {
    const userId = request.userId;
    const status = request.status;

    const queryBody = { userId };
    if (status) {
      queryBody['status'] = status;
    }

    return this.orderRepository.find({
      where: queryBody,
      order: { createdAt: 'DESC' },
    });
  }

  public async payOrder(orderId: number): Promise<void> {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException('Order does not exist');
    }

    if (order.status === OrderStatus.SUCCESS) {
      throw new BadRequestException('Order is already paid');
    }

    const amount = order.amount;
    try {
      const paymentResult = await this.paymentService.pay({
        amount,
        currency: CurrencyCode.TWD,
      });
    } catch {
      throw new BadRequestException('Payment failed');
    }

    order.status = OrderStatus.SUCCESS;
    await this.orderRepository.save(order);
  }
}
