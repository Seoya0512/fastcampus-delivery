import { USER_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RegisterDto } from './dto/register.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_SERVICE) private readonly userMicroservice: ClientProxy,
  ) {}

  register(token: string, registerDto: RegisterDto) {
    return lastValueFrom(
      this.userMicroservice.send(
        {
          cmd: 'register',
        },
        {
          ...registerDto,
          token,
        },
      ),
    );
  }

  login(token: string) {
    return lastValueFrom(
      this.userMicroservice.send(
        {
          cmd: 'login',
        },
        {
          token,
        },
      ),
    );
  }
}
