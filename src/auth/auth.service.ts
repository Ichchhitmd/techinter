import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorService } from '../author/author.service';
import { Author } from '../author/entity/author.entity';
import {
  JwtPayload,
  RefreshTokenPayload,
} from './interfaces/jwt-payload.interface';
import { RefreshToken } from './entity/refresh-token.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private authorService: AuthorService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async validateAuthor(email: string, password: string): Promise<Author> {
    const author = await this.authorService.findByEmail(email);
    if (!author) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!author.password) {
      throw new UnauthorizedException('Password not set for this account');
    }

    const isPasswordValid = await bcrypt.compare(password, author.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!author.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    return author;
  }

  async login(email: string, password: string) {
    const author = await this.validateAuthor(email, password);

    const tokens = await this.getTokens(author);

    await this.storeRefreshToken(author.id, tokens.refreshTokenId);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      author: {
        id: author.id,
        name: author.name,
        email: author.email,
        role: author.role,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'fallback-secret-key',
      }) as RefreshTokenPayload;

      const storedToken = await this.refreshTokenRepository.findOne({
        where: { id: payload.refreshTokenId, authorId: payload.sub },
      });

      if (
        !storedToken ||
        storedToken.isRevoked ||
        new Date() > storedToken.expiresAt
      ) {
        throw new ForbiddenException('Access denied');
      }

      const author = await this.authorService.findOne(payload.sub);
      if (!author) {
        throw new ForbiddenException('Access denied');
      }
      await this.revokeRefreshToken(storedToken.id);

      const tokens = await this.getTokens(author);

      await this.storeRefreshToken(author.id, tokens.refreshTokenId);

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    } catch (error) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'fallback-secret-key',
      }) as RefreshTokenPayload;

      await this.revokeRefreshToken(payload.refreshTokenId);
      return { success: true };
    } catch (error) {
      return { success: true };
    }
  }

  private async getTokens(author: Author) {
    const refreshTokenId = uuidv4();

    const jwtPayload: JwtPayload = {
      email: author.email,
      sub: author.id,
      id: author.id,
      name: author.name,
      role: author.role,
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: author.id,
      refreshTokenId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload),
      this.jwtService.signAsync(refreshPayload, {
        secret: process.env.JWT_SECRET || 'fallback-secret-key',
        expiresIn: '10h',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      refreshTokenId,
    };
  }

  private async storeRefreshToken(authorId: number, tokenId: string) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 10);

    const refreshToken = this.refreshTokenRepository.create({
      id: tokenId,
      authorId,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);
  }

  private async revokeRefreshToken(tokenId: string) {
    await this.refreshTokenRepository.update(tokenId, { isRevoked: true });
  }
}
