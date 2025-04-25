import {
  Controller,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { RpcInterceptor } from '@app/common';
import { GetProductsInfo } from 'apps/product/src/product/dto/get-products-info.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'get_products_info' })
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  getProductsInfo(@Payload() data: GetProductsInfo) {
    return this.productService.getProductsInfo(data.productIds);
  }

  @MessagePattern({ cmd: 'create_samples' })
  createProduct() {
    return this.productService.createSamples();
  }
}
