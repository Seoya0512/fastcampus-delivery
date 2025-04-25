import { Controller, UseInterceptors } from '@nestjs/common';
import { OrderService } from './order.service';
import { RpcInterceptor } from '@app/common';
import { EventPattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';
import { OrderStatus } from './entity/order.entity';
import { DeliveryStartedDto } from './dto/delivery-start.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @EventPattern({ cmd: 'create_order' })
  async createOrder(@Payload() createOrderDto: CreateOrderDto) {
    return await this.orderService.createOrder(createOrderDto);
  }

  @EventPattern({ cmd: 'delivery_started' })
  @UseInterceptors(RpcInterceptor)
  async deliveryStarted(@Payload() payload: DeliveryStartedDto) {
    await this.orderService.changeOrderStatus(
      payload.id,
      OrderStatus.deliveryStarted,
    );
  }
}
