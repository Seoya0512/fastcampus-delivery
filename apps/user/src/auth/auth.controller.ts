import {
  Controller,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-dto';
import { MessagePattern } from '@nestjs/microservices';
import { ParseBearerTokenDto } from 'apps/payment/src/payment/dto/parse-bearer-token.dto';
import { Payload } from '@nestjs/microservices';
import { RpcInterceptor } from '@app/common';
import { LoginDto } from 'apps/user/src/auth/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(ValidationPipe)
  @UseInterceptors(RpcInterceptor)
  @MessagePattern({ cmd: 'parse_bearer_token' })
  parseBearerToken(@Payload() payload: ParseBearerTokenDto) {
    return this.authService.parseBearerToken(payload.token, false);
  }

  @MessagePattern({ cmd: 'register' })
  registerUser(@Payload() registerDto: RegisterDto) {
    if (registerDto.token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요!');
    }
    return this.authService.register(registerDto);
  }

  @MessagePattern({ cmd: 'login' })
  loginUser(@Payload() loginDto: LoginDto) {
    const { token } = loginDto;

    if (token === null) {
      throw new UnauthorizedException('토큰을 입력해주세요!');
    }
    return this.authService.login(token);
  }
}
