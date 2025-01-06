import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { OrderService } from '../service/order.service';
import { OrderResponse } from '../response/order.response';
import { CreateOrderRequest } from '../request/create-order.request';
import { OrderListResponse } from '../response/order-list.response';
import { SearchOrdersRequest } from '../request/search-orders.request';
import { PayOrderResponse } from '../response/pay-order.response';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  public async createOrder(
    @Body() request: CreateOrderRequest,
  ): Promise<OrderResponse> {
    const order = await this.orderService.createOrder(
      request.userId,
      request.rentingHistoryId,
      request.amount,
    );

    return OrderResponse.fromEntity(order);
  }

  @Get('list')
  public async searchOrders(
    @Query() query: SearchOrdersRequest,
  ): Promise<OrderListResponse> {
    const orders = await this.orderService.searchOrders(query);
    return OrderListResponse.fromEntities(orders);
  }

  @Post(':orderId/pay')
  @HttpCode(200)
  public async payOrder(
    @Param('orderId') orderId: number,
  ): Promise<PayOrderResponse> {
    const result = await this.orderService.payOrder(orderId);
    return PayOrderResponse.from(result);
  }
}
