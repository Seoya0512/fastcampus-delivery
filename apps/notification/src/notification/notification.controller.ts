import {
  Controller,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { SendPaymentNotificationDto } from './dto/send-payment-notification.dto';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern({ cmd: 'send_payment_notification' })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  async sendPaymentNotification(
    @Payload() payload: SendPaymentNotificationDto,
  ) {
    return await this.notificationService.sendPaymentNotification(payload);
  }
}
