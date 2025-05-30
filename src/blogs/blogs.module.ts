import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entity/blog.entity';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Blog])],
  providers: [BlogsService],
  exports: [BlogsService],
  controllers: [BlogsController],
})
export class BlogsModule {}
