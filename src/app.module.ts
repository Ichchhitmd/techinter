import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsModule } from './blogs/blogs.module';
import { AuthorModule } from './author/author.module';
import { AuthModule } from './auth/auth.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { BlahService } from './blah/blah.service';

import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    BlogsModule,
    AuthorModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, BlahService],
})
export class AppModule {}
