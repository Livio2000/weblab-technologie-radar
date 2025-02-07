import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private configService: ConfigService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) { 
      throw new UnauthorizedException('Invalid credentials');
    }
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const user = await this.validateUser(email, password);
    const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'defaultSecretKey';
    const token = jwt.sign(user, jwtSecret, { expiresIn: '1h' });
    return { token };
  }
}