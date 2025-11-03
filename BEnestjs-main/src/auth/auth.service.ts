import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Validate username + password
  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) throw new UnauthorizedException('User not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid password');

    // don’t return password
    const { password: _, ...result } = user;
    return result;
  }

  // Generate JWT token
  async login(user: any) {
    const payload = { sub: user._id, username: user.username, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}