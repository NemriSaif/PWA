import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Stock } from './schemas/stock.schema';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<Stock>,
  ) {}

  async create(createStockDto: CreateStockDto): Promise<Stock> {
    const stock = new this.stockModel(createStockDto);
    return stock.save();
  }

  async findAll(): Promise<Stock[]> {
    return this.stockModel
      .find()
      .populate('fournisseur')
      .populate('chantier')
      .exec();
  }

  async findOne(id: string): Promise<Stock> {
    const stock = await this.stockModel
      .findById(id)
      .populate('fournisseur')
      .populate('chantier')
      .exec();
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    return stock;
  }

  async update(id: string, updateStockDto: UpdateStockDto): Promise<Stock> {
    const stock = await this.stockModel
      .findByIdAndUpdate(id, updateStockDto, { new: true })
      .populate('fournisseur')
      .populate('chantier')
      .exec();
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    return stock;
  }

  async remove(id: string): Promise<void> {
    const result = await this.stockModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
  }
}
