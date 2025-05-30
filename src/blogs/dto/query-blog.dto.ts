import { IsOptional, IsInt, Min, IsString, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryBlogDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  tag?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  authorId?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeDeleted?: boolean = false;
}
