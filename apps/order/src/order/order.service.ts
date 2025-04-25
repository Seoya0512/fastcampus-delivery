import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { USER_SERVICE, PRODUCT_SERVICE, PAYMENT_SERVICE } from '@app/common';
import { PaymentCancelledException } from './exception/payment-cancelled.exception';
import { Product } from 'apps/product/src/product/entity/product.entity';
import { Customer } from 'apps/order/src/order/entity/customer.entity';
import { AddressDto } from './dto/address.dto';
import { PaymentDto } from './dto/payment.dto';
import { Order, OrderStatus } from './entity/order.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaymentFailedException } from './exception/payment-failed.exception';
import { PaymentStatus } from 'apps/payment/src/payment/entity/payment.entity';

@Injectable()
export class OrderService {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: ClientProxy,
    @Inject(PRODUCT_SERVICE)
    private readonly productService: ClientProxy,
    @Inject(PAYMENT_SERVICE)
    private readonly paymentService: ClientProxy,
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const { productIds, address, payment, meta } = createOrderDto;
    /// 1) 사용자 정보 가져오기
    const user = await this.getUserFromToken(meta.user.sub);
    /// 2) 상품 정보 가져오기
    const products = await this.getProductsByIds(productIds);
    /// 3) 총 금액 계산하기
    const totalAmount = this.calculateTotalAmount(products);
    /// 4) 금액 검증하기 - total이 맞는지 (프론트에서 보내준 데이터랑)
    this.validatePaymentAmount(totalAmount, payment.amount);
    /// 5) 주문 생성하기 - 데이터베이스에 넣기
    const customer = this.createCustomer(user);
    const order = await this.createNewOrder(
      customer,
      products,
      address,
      payment,
    );
    /// 6) 결제 시도하기
    const processedPayment = await this.processPayment(
      order._id.toString(),
      payment,
      user.email,
    );
    /// 7) 결과 반환하기
    return this.orderModel.findById(order._id.toString());
  }

  private async getUserFromToken(userId: string) {
    const uResp = await lastValueFrom(
      this.userService.send({ cmd: 'get_user_info' }, { userId }),
    );

    if (uResp.status === 'error') {
      throw new PaymentCancelledException(uResp);
    }

    return uResp.data;
  }

  private async getProductsByIds(productIds: string[]): Promise<Product[]> {
    const pResp = await lastValueFrom(
      this.productService.send({ cmd: 'get_products_info' }, { productIds }),
    );

    if (pResp.status === 'error') {
      throw new PaymentCancelledException('상품 정보가 잘못됐습니다.');
    }

    // productEntity로 전환
    return pResp.data.map((product) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: product.quantity,
    }));
  }

  private calculateTotalAmount(products: Product[]) {
    return products.reduce((acc, next) => acc + next.price, 0);
  }

  private validatePaymentAmount(totalA: number, totalB: number) {
    if (totalA !== totalB) {
      throw new PaymentCancelledException('결제 금액이 올바르지 않습니다.');
    }
  }

  private createCustomer(user: { id: string; email: string; name: string }) {
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
    };
  }

  private createNewOrder(
    customer: Customer,
    products: Product[],
    deliveryAddress: AddressDto,
    payment: PaymentDto,
  ) {
    return this.orderModel.create({
      customer,
      products,
      deliveryAddress,
      payment,
    });
  }

  private async processPayment(
    orderId: string,
    payment: PaymentDto,
    userEmail: string,
  ) {
    try {
      const resp = await lastValueFrom(
        this.paymentService.send(
          { cmd: 'make_payment' },
          { ...payment, orderId, userEmail },
        ),
      );

      if (resp.status === 'error') {
        throw new PaymentCancelledException(resp);
      }

      const isPaid = resp.data.paymentStatus === PaymentStatus.approved;
      const orderStatus = isPaid
        ? OrderStatus.paymentProcessed
        : OrderStatus.paymentFailed;

      if (orderStatus === OrderStatus.paymentFailed) {
        throw new PaymentCancelledException(resp);
      }

      await this.orderModel.findByIdAndUpdate(orderId, {
        status: OrderStatus.paymentProcessed,
      });

      return resp;
    } catch (err) {
      if (err instanceof PaymentFailedException) {
        await this.orderModel.findByIdAndUpdate(orderId, {
          status: OrderStatus.paymentFailed,
        });
      }
    }
  }

  changeOrderStatus(orderId: string, status: OrderStatus) {
    return this.orderModel.findByIdAndUpdate(orderId, { status });
  }
}
