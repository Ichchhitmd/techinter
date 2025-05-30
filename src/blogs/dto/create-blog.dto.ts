import { IsArray, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsInt()
  authorId: number;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
