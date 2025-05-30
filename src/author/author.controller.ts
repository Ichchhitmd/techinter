import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { Author } from './entity/author.entity';

@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  create(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.authorService.create(createAuthorDto);
  }

  @Get()
  findAll(): Promise<Author[]> {
    return this.authorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Author> {
    return this.authorService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.authorService.remove(id);
  }

  @Patch(':id/password')
  updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('password') password: string,
  ): Promise<void> {
    return this.authorService.updatePassword(id, password);
  }
}
