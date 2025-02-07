import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller({
    path: 'auth',
    version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
