import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';
import { Vehicule } from './schemas/vehicule.schema';

@Injectable()
export class VehiculeService {
  constructor(
    @InjectModel(Vehicule.name) private vehiculeModel: Model<Vehicule>,
  ) {}

  async create(createVehiculeDto: CreateVehiculeDto): Promise<Vehicule> {
    const createdVehicule = new this.vehiculeModel(createVehiculeDto);
    return createdVehicule.save();
  }

  async findAll(): Promise<Vehicule[]> {
    return this.vehiculeModel.find().exec();
  }

  async findOne(id: string): Promise<Vehicule> {
    const vehicule = await this.vehiculeModel.findById(id).exec();
    if (!vehicule) throw new NotFoundException('Vehicule not found');
    return vehicule;
  }

  async update(
    id: string,
    updateVehiculeDto: UpdateVehiculeDto,
  ): Promise<Vehicule> {
    console.log('🔄 Updating vehicle:', id);
    console.log('📝 Update data:', updateVehiculeDto);
    
    const updated = await this.vehiculeModel
      .findByIdAndUpdate(id, updateVehiculeDto, { 
        new: true,
        runValidators: true 
      })
      .exec();
      
    if (!updated) throw new NotFoundException('Vehicule not found');
    
    console.log('✅ Updated vehicle:', updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.vehiculeModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Vehicule not found');
  }
}
