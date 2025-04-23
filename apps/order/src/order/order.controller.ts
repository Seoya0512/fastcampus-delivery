import { Controller, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';
import { Authorization } from 'apps/user/src/auth/decorator/authorization.decorator';
import { CreateOrderDto } from 'apps/order/src/order/dto/create-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @Authorization() token: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return await this.orderService.createOrder(createOrderDto, token);
  }
}
