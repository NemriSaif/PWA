import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Personnel } from '../../personnel/schemas/personnel.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Personnel.name) private personnelModel: Model<Personnel>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    // Check if this is a personnel login
    if (payload.role === 'PERSONNEL' || payload.personnelId) {
      const personnel = await this.personnelModel.findById(payload.personnelId || payload.sub);
      if (!personnel) {
        throw new UnauthorizedException('Personnel not found');
      }
      // Return personnel data in user format
      return {
        _id: personnel._id,
        id: personnel._id,
        email: personnel.phone,
        name: personnel.name,
        role: 'PERSONNEL',
        phone: personnel.phone,
        cin: personnel.cin,
      };
    }

    // Regular user login
    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
