import { IsString, IsArray, IsInt, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMarcoTeoricoDto {
  @ApiProperty({ example: 'lora-lorawan' })
  @IsString()
  @MinLength(2)
  slug: string;

  @ApiProperty({ example: '2.2. LoRa y LoRaWAN' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({ description: 'HTML del contenido (se sanitiza en servidor)' })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  references?: string[];

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  order?: number;
}
