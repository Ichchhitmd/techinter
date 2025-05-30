import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';

class LoginDto {
  email: string;
  password: string;
}

class RefreshTokenDto {
  refresh_token: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refresh_token);
  }
}
