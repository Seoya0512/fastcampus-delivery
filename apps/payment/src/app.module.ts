import { NOTIFICATION_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from 'apps/payment/src/payment/payment.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_URL: Joi.string().required(),
        NOTIFICATION_HOST: Joi.string().required(),
        NOTIFICATION_TCP_PORT: Joi.number().required(),
      }),
    }),
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: NOTIFICATION_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              host: configService.getOrThrow<string>('NOTIFICATION_HOST'),
              port: configService.getOrThrow<number>('NOTIFICATION_TCP_PORT'),
            },
          }),
          inject: [ConfigService],
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow('DB_URL'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    PaymentModule,
  ],
})
export class AppModule {}
