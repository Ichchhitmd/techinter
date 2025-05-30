import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthorService } from '../author/author.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authorService: AuthorService) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const author = await this.authorService.findOne(payload.sub);

    if (!author || !author.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: author.id,
      email: author.email,
      name: author.name,
      role: author.role,
    };
  }
}
