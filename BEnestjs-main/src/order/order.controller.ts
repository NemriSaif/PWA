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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@Controller('order')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.orderService.create(createOrderDto, req.user._id);
  }

  @Get()
  findAll(@Request() req) {
    return this.orderService.findAll(req.user._id, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.orderService.findOne(id, req.user._id, req.user.role);
  }

  @Patch(':id')
  @Roles(UserRole.FOURNISSEUR)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @Request() req) {
    return this.orderService.updateStatus(id, updateOrderDto, req.user._id, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  remove(@Param('id') id: string, @Request() req) {
    return this.orderService.remove(id, req.user._id, req.user.role);
  }
}
