import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../author/entity/author.entity';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogDto } from './dto/query-blog.dto';
import { Blog } from './entity/blog.entity';

@Controller('posts')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  findAllForAdmin() {
    return this.blogsService.findAll({ includeDeleted: true });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createBlogDto: CreateBlogDto,
    @Request() req: RequestWithUser,
  ): Promise<Blog> {
    const authorId = req.user.id;
    return this.blogsService.create({ ...createBlogDto, authorId });
  }

  @Get()
  findAll(@Query() queryParams: QueryBlogDto) {
    return this.blogsService.findAll(queryParams);
  }

  @Get('author/:authorId')
  findByAuthor(
    @Param('authorId', ParseIntPipe) authorId: number,
    @Query() queryParams: QueryBlogDto,
  ) {
    return this.blogsService.findAllByAuthor(authorId, queryParams);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Blog> {
    return this.blogsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    const authorId = req.user.id;
    const userRole = req.user.role;
    const blog = await this.blogsService.findOne(id);

    if (userRole !== UserRole.ADMIN && blog.author.id !== authorId) {
      throw new ForbiddenException('You can only delete your own blog posts');
    }

    return this.blogsService.remove(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlogDto: UpdateBlogDto,
    @Request() req: RequestWithUser,
  ): Promise<Blog> {
    const authorId = req.user.id;
    const userRole = req.user.role;
    const blog = await this.blogsService.findOne(id);

    if (userRole !== UserRole.ADMIN && blog.author.id !== authorId) {
      throw new ForbiddenException('You can only update your own blog posts');
    }

    return this.blogsService.update(id, updateBlogDto);
  }
}
