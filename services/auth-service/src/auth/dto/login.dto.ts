import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'estudiante@ucundinamarca.edu.co' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'PasswordSegura2026!' })
  @IsString()
  @MinLength(1)
  password: string;
}
