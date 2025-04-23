import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-dto';
import { Authorization } from './decorator/authorization.decorator';
import { MessagePattern } from '@nestjs/microservices';
import { ParseBearerTokenDto } from 'apps/payment/src/payment/dto/parse-bearer-token.dto';
import { Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(ValidationPipe)
  registerUser(
    @Authorization() token: string,
    @Body() registerDto: RegisterDto,
  ) {
    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요!');
    }
    return this.authService.register(token, registerDto);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  loginUser(@Authorization() token: string) {
    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요!');
    }
    return this.authService.login(token);
  }
  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  @MessagePattern({ cmd: 'parse_bearer_token' })
  parseBearerToken(@Payload() payload: ParseBearerTokenDto) {
    console.log('requested Payload', payload);
    return this.authService.parseBearerToken(payload.token, false);
  }
}
