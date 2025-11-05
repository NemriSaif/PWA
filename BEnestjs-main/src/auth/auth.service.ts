import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { User } from '../user/schemas/user.schema';
import { Personnel } from '../personnel/schemas/personnel.schema';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Personnel.name) private personnelModel: Model<Personnel>,
    private jwtService: JwtService,
  ) {
    // Configure nodemailer (update with your SMTP settings)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name, role, phone, company } = registerDto;

    // Check if user exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      role,
      phone,
      company,
    });

    await user.save();

    // Generate token
    const token = this.jwtService.sign({
      sub: user._id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        company: user.company,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // First, try to find a regular user by email
    const user = await this.userModel.findOne({ email });
    
    if (user) {
      // Regular user login with email and password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Account is disabled');
      }

      // Generate token
      const token = this.jwtService.sign({
        sub: user._id,
        email: user.email,
        role: user.role,
      });

      return {
        access_token: token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          company: user.company,
        },
      };
    }

    // If no user found, try personnel login (phone as email, CIN as password)
    const personnel = await this.personnelModel.findOne({ 
      phone: email, 
      cin: password 
    });
    
    if (!personnel) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token for personnel
    const token = this.jwtService.sign({
      sub: personnel._id,
      email: personnel.phone, // Use phone as identifier
      role: 'PERSONNEL',
      personnelId: personnel._id,
    });

    return {
      access_token: token,
      user: {
        id: personnel._id,
        email: personnel.phone,
        name: personnel.name,
        role: 'PERSONNEL',
        phone: personnel.phone,
        cin: personnel.cin,
        salary: personnel.salary,
        isPayed: personnel.isPayed,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return { message: 'Password reset email sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return { message: 'Password reset successfully' };
  }

  async validateUser(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async getUsers(role?: string) {
    const query = role ? { role } : {};
    return this.userModel.find(query).select('-password').exec();
  }

  async updateUser(id: string, updateData: any) {
    // Don't allow password updates through this endpoint
    delete updateData.password;
    
    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async deleteUser(id: string) {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
