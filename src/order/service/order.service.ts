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
import { PayOrderResult } from '../dto/pay-order-result.dto';
import { OrderNoGeneratorUtility } from '../utility/order-no-generator.utility';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderNoGeneratorUtility: OrderNoGeneratorUtility,
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
      orderNo: this.orderNoGeneratorUtility.generateOrderNo(),
      amount,
      status: OrderStatus.PENDING,
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

  public async payOrder(orderNo: string): Promise<PayOrderResult> {
    const order = await this.orderRepository.findOneBy({ orderNo: orderNo });
    if (!order) {
      throw new NotFoundException('Order does not exist');
    }

    if (order.status === OrderStatus.SUCCESS) {
      throw new BadRequestException('Order is already paid');
    }

    const paymentResultCommon = {
      userId: order.userId,
      orderNo: order.orderNo,
      amount: order.amount,
      currency: CurrencyCode.TWD,
      payAt: new Date(),
    };

    try {
      await this.paymentService.pay({
        amount: order.amount,
        currency: CurrencyCode.TWD,
      });
    } catch {
      return { ...paymentResultCommon, status: 'FAILED' };
    }

    order.status = OrderStatus.SUCCESS;
    await this.orderRepository.save(order);

    return { ...paymentResultCommon, status: 'SUCCESS' };
  }
}
