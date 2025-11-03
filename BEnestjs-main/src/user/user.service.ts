import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(dto: { username: string; password: string; role?: string; email?: string }) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const created = new this.userModel({ ...dto, password: hashed });
    return created.save();
  }

  findAll() {
    // password is select:false so not included
    return this.userModel.find().lean().exec();
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).lean().exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: Partial<{ username: string; password: string; role: string; email: string }>) {
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    const updated = await this.userModel.findByIdAndUpdate(id, dto, { new: true }).lean().exec();
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async remove(id: string) {
    const res = await this.userModel.findByIdAndDelete(id).lean().exec();
    if (!res) throw new NotFoundException('User not found');
    return { deleted: true };
  }
  async findByUsername(username: string) {
  return this.userModel.findOne({ username }).select('+password').lean().exec();
}
}