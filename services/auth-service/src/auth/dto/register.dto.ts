import { IsEmail, IsString, MinLength, MaxLength, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'estudiante@ucundinamarca.edu.co' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'PasswordSegura2026!' })
  @IsString()
  @MinLength(10)
  @MaxLength(72)
  password: string;

  @ApiProperty({ example: 'Ana Pérez' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ enum: ['docente', 'estudiante', 'visitante'], required: false })
  @IsOptional()
  @IsIn(['docente', 'estudiante', 'visitante'])
  role?: string;
}
