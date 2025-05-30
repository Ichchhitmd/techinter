import { Module } from '@nestjs/common';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';
import { Author } from './entity/author.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Author])],
  controllers: [AuthorController],
  providers: [AuthorService],
  exports: [AuthorService],
})
export class AuthorModule {}
