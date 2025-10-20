import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { UpdatePersonnelDto } from './dto/update-personnel.dto';
import { Personnel } from './schemas/personnel.schema';

@Injectable()
export class PersonnelService {
  constructor(
    @InjectModel(Personnel.name) private personnelModel: Model<Personnel>,
  ) {}

  async create(createPersonnelDto: CreatePersonnelDto): Promise<Personnel> {
    const createdPersonnel = new this.personnelModel(createPersonnelDto);
    return createdPersonnel.save();
  }

  async findAll(): Promise<Personnel[]> {
    return this.personnelModel.find().exec();
  }

  async findOne(id: string): Promise<Personnel> {
    const personnel = await this.personnelModel.findById(id).exec();
    if (!personnel) throw new NotFoundException('Personnel not found');
    return personnel;
  }

  async update(
    id: string,
    updatePersonnelDto: UpdatePersonnelDto,
  ): Promise<Personnel> {
    const updated = await this.personnelModel
      .findByIdAndUpdate(id, updatePersonnelDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Personnel not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.personnelModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Personnel not found');
  }
}
