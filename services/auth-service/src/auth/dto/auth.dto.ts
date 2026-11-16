import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MSG, PASSWORD_RULE } from '../../users/dto/user.dto';

export class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(2) @MaxLength(120) name: string;
  @Matches(PASSWORD_RULE, { message: PASSWORD_MSG }) password: string;
}
export class LoginDto { @IsEmail() email: string; @IsString() @MaxLength(72) password: string; }
export class RefreshDto { @IsString() @MinLength(32) @MaxLength(256) refreshToken: string; }
