import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';
import { Fournisseur } from './schemas/fournisseur.schema';

@Injectable()
export class FournisseurService {
  constructor(
    @InjectModel(Fournisseur.name) private fournisseurModel: Model<Fournisseur>,
  ) {}

  async create(createFournisseurDto: CreateFournisseurDto): Promise<Fournisseur> {
    const fournisseur = new this.fournisseurModel(createFournisseurDto);
    return fournisseur.save();
  }

  async findAll(): Promise<Fournisseur[]> {
    return this.fournisseurModel.find().exec();
  }

  async findOne(id: string): Promise<Fournisseur> {
    const fournisseur = await this.fournisseurModel.findById(id).exec();
    if (!fournisseur) {
      throw new NotFoundException(`Fournisseur with ID ${id} not found`);
    }
    return fournisseur;
  }

  async update(id: string, updateFournisseurDto: UpdateFournisseurDto): Promise<Fournisseur> {
    const fournisseur = await this.fournisseurModel
      .findByIdAndUpdate(id, updateFournisseurDto, { new: true })
      .exec();
    if (!fournisseur) {
      throw new NotFoundException(`Fournisseur with ID ${id} not found`);
    }
    return fournisseur;
  }

  async remove(id: string): Promise<void> {
    const result = await this.fournisseurModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Fournisseur with ID ${id} not found`);
    }
  }
}
