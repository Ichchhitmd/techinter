import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthorModule } from '../author/author.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { RefreshToken } from './entity/refresh-token.entity';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    AuthorModule,
    PassportModule,
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-key',
      signOptions: { expiresIn: '15m' }, // Shorter expiration for access tokens
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
