import { IsEnum, IsInt, IsNotEmpty, IsPositive, Validate, ValidateIf } from 'class-validator';
import { OrderStatus } from '../enum/order-status.enum';
import { Transform } from 'class-transformer';

export class SearchOrdersRequest {
  @Transform(({ value }) => parseInt(value))
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  userId: number;

  @ValidateIf((o) => o.status !== null && o.status !== undefined)
  @IsEnum(Object.values(OrderStatus))
  status: OrderStatus | null;
}
