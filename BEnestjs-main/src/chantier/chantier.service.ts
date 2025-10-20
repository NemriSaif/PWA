import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chantier } from './schemas/chantier.schema';
import { CreateChantierDto } from './dto/create-chantier.dto';
import { UpdateChantierDto } from './dto/update-chantier.dto';

@Injectable()
export class ChantierService {
  constructor(@InjectModel(Chantier.name) private chantierModel: Model<Chantier>) {}

  async create(createChantierDto: CreateChantierDto): Promise<Chantier> {
    const chantier = new this.chantierModel(createChantierDto);
    return chantier.save();
  }

   async findAll() {
    return this.chantierModel
      .find()
      .populate('personnelAssignments.personnel') // nested populate
      .populate('vehiculeAssignments.vehicule')   // nested populate
      .exec();
  }

  async findOne(id: string): Promise<Chantier> {
    const chantier = await this.chantierModel.findById(id)
      .populate('personnels')
      .populate('vehicules')
      .exec();
    if (!chantier) throw new NotFoundException('Chantier not found');
    return chantier;
  }

  async update(id: string, updateChantierDto: UpdateChantierDto): Promise<Chantier> {
  const updatedChantier = await this.chantierModel
    .findByIdAndUpdate(id, updateChantierDto, { new: true })
    .exec();

  if (!updatedChantier) {
    throw new NotFoundException(`Chantier with ID ${id} not found`);
  }

  return updatedChantier;
}


  async remove(id: string): Promise<void> {
    await this.chantierModel.findByIdAndDelete(id).exec();
  }

  //assign personnel to chantier
 async assignPersonnel(chantierId: string, personnelId: string, date: Date): Promise<Chantier> {
  const chantier = await this.chantierModel.findById(chantierId);
  if (!chantier) throw new NotFoundException('Chantier not found');

  chantier.personnelAssignments = [
    ...(chantier.personnelAssignments || []).filter(
      pa => !(pa.personnel.toString() === personnelId && pa.date.toISOString() === date.toISOString())
    ),
    { personnel: new Types.ObjectId(personnelId), date },
  ];

  return chantier.save();
}


// remove personnel from chantier
async removePersonnel(chantierId: string, personnelId: string, date: Date): Promise<Chantier> {
  const chantier = await this.chantierModel.findById(chantierId);
  if (!chantier) throw new NotFoundException('Chantier not found');

  chantier.personnelAssignments = (chantier.personnelAssignments || []).filter(
    pa => !(pa.personnel.toString() === personnelId && pa.date.toISOString() === date.toISOString())
  );

  return chantier.save();
}

// Assign a vehicle to a chantier for a specific date
async assignVehicule(chantierId: string, vehiculeId: string, date: Date): Promise<Chantier> {
  const chantier = await this.chantierModel.findById(chantierId);
  if (!chantier) throw new NotFoundException('Chantier not found');

  chantier.vehiculeAssignments = [
    ...(chantier.vehiculeAssignments || []).filter(
      va => !(va.vehicule.toString() === vehiculeId && va.date.toISOString() === date.toISOString())
    ),
    { vehicule: new Types.ObjectId(vehiculeId), date },
  ];

  return chantier.save();
}

// Remove a vehicle from a chantier for a specific date
async removeVehicule(chantierId: string, vehiculeId: string, date: Date): Promise<Chantier> {
  const chantier = await this.chantierModel.findById(chantierId);
  if (!chantier) throw new NotFoundException('Chantier not found');

  chantier.vehiculeAssignments = (chantier.vehiculeAssignments || []).filter(
    va => !(va.vehicule.toString() === vehiculeId && va.date.toISOString() === date.toISOString())
  );

  return chantier.save();
}


}
