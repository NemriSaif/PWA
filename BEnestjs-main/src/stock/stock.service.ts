import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Stock } from './schemas/stock.schema';
import { UserRole } from '../user/schemas/user.schema';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(Stock.name) private stockModel: Model<Stock>,
  ) {}

  async create(createStockDto: CreateStockDto, userId: string): Promise<Stock> {
    const stock = new this.stockModel({
      ...createStockDto,
      owner: userId,
    });
    return stock.save();
  }

  async findAll(userId: string, userRole: UserRole): Promise<Stock[]> {
    const query: any = {};
    
    if (userRole === UserRole.FOURNISSEUR) {
      query.owner = userId;
    } else if (userRole === UserRole.MANAGER) {
      // Managers see only their own stock (stock they own)
      query.owner = userId;
    }

    console.log(`🔍 Finding stock for ${userRole}:`, { userId, query });

    const results = await this.stockModel
      .find(query)
      .populate('chantier')
      .populate('owner', 'name email company')
      .exec();

    console.log(`📦 Found ${results.length} stock items for ${userRole}`);
    
    return results;
  }

  async findAllSuppliersStock(): Promise<Stock[]> {
    // Get all stock from suppliers (not managers)
    const suppliers = await this.stockModel
      .find()
      .populate('owner', 'name email company role')
      .exec();

    // Filter only stock owned by suppliers
    return suppliers.filter((stock: any) => stock.owner?.role === UserRole.FOURNISSEUR);
  }

  async findOne(id: string): Promise<Stock> {
    const stock = await this.stockModel
      .findById(id)
      .populate('chantier')
      .populate('owner', 'name email company')
      .exec();
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    return stock;
  }

  async update(id: string, updateStockDto: UpdateStockDto, userId: string): Promise<Stock> {
    const stock = await this.stockModel.findById(id);
    
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }

    if (stock.owner.toString() !== userId) {
      throw new ForbiddenException('You can only update your own stock items');
    }

    const updatedStock = await this.stockModel
      .findByIdAndUpdate(id, updateStockDto, { new: true })
      .populate('chantier')
      .populate('owner', 'name email company')
      .exec();
    
    if (!updatedStock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }
    
    return updatedStock;
  }

  async remove(id: string, userId: string): Promise<void> {
    const stock = await this.stockModel.findById(id);
    
    if (!stock) {
      throw new NotFoundException(`Stock with ID ${id} not found`);
    }

    if (stock.owner.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own stock items');
    }

    await this.stockModel.findByIdAndDelete(id).exec();
  }
}
