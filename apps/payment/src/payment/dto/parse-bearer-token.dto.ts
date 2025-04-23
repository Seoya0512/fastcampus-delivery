import { IsString } from 'class-validator';

import { IsNotEmpty } from 'class-validator';

export class ParseBearerTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
