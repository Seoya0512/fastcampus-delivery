import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ORDER_SERVICE, UserMeta, UserPayloadDto } from '@app/common';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderMicroService: ClientProxy,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    userPayload: UserPayloadDto,
  ) {
    return this.orderMicroService.send<any, CreateOrderDto & UserMeta>(
      {
        cmd: 'create_order',
      },
      {
        ...createOrderDto,
        meta: {
          user: userPayload,
        },
      },
    );
  }
}
