import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

export class CreateMarcoDto {
  @Matches(/^[a-z0-9-]+$/, { message: 'slug solo admite minúsculas, números y guiones' }) slug: string;
  @IsString() @MaxLength(200) title: string;
  @IsString() @MaxLength(200_000) content: string;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) references?: string[];
  @IsOptional() @IsInt() @Min(0) order?: number;
}
export class UpdateMarcoDto {
  @IsOptional() @IsString() @MaxLength(200) title?: string;
  @IsOptional() @IsString() @MaxLength(200_000) content?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) references?: string[];
  @IsOptional() @IsInt() @Min(0) order?: number;
}
export class ListQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number = 20;
  @IsOptional() @IsString() @MaxLength(100) q?: string;
}
