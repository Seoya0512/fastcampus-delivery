import { ORDER_SERVICE } from '@app/common';
import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from 'apps/notification/src/notification/notification.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_URL: Joi.string().required(),
        ORDER_HOST: Joi.string().required(),
        ORDER_TCP_PORT: Joi.number().required(),
      }),
    }),
    ClientsModule.registerAsync({
      clients: [
        {
          name: ORDER_SERVICE,
          useFactory: (configService: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              host: configService.getOrThrow<string>('ORDER_HOST'),
              port: configService.getOrThrow<number>('ORDER_TCP_PORT'),
            },
          }),
          inject: [ConfigService],
        },
      ],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('DB_URL'),
      }),
      inject: [ConfigService],
    }),
    NotificationModule,
  ],
})
export class AppModule {}
