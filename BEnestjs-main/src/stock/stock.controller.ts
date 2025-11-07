import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @Roles(UserRole.FOURNISSEUR)
  create(@Body() createStockDto: CreateStockDto, @Request() req) {
    return this.stockService.create(createStockDto, req.user._id);
  }

  @Get()
  findAll(@Request() req) {
    return this.stockService.findAll(req.user._id, req.user.role);
  }

  @Get('suppliers/all')
  findAllSuppliersStock(@Request() req) {
    // Only managers can view all suppliers' stock
    if (req.user.role !== 'manager') {
      throw new Error('Only managers can view suppliers stock');
    }
    return this.stockService.findAllSuppliersStock();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.FOURNISSEUR)
  update(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto, @Request() req) {
    return this.stockService.update(id, updateStockDto, req.user._id);
  }

  @Delete(':id')
  @Roles(UserRole.FOURNISSEUR)
  remove(@Param('id') id: string, @Request() req) {
    return this.stockService.remove(id, req.user._id);
  }

  @Post(':id/consume')
  @Roles(UserRole.MANAGER)
  consumeStock(@Param('id') id: string, @Body() body: { quantityUsed: number }, @Request() req) {
    console.log('🔵 Stock Consume Controller:');
    console.log('  Stock ID:', id);
    console.log('  Quantity to consume:', body.quantityUsed);
    console.log('  Request user._id:', req.user._id);
    console.log('  Request user._id (string):', req.user._id.toString());
    // Convert ObjectId to string before passing to service
    return this.stockService.consumeStock(id, body.quantityUsed, req.user._id.toString());
  }
}
