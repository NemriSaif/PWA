import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderStatus } from './schemas/order.schema';
import { Stock } from '../stock/schemas/stock.schema';
import { UserRole } from '../user/schemas/user.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Stock.name) private stockModel: Model<Stock>,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    const stock = await this.stockModel.findById(createOrderDto.stockItem).populate('owner');
    if (!stock) {
      throw new NotFoundException('Stock item not found');
    }

    const totalPrice = stock.price * createOrderDto.quantity;

    const order = new this.orderModel({
      manager: userId,
      supplier: stock.owner,
      stockItem: createOrderDto.stockItem,
      quantity: createOrderDto.quantity,
      totalPrice,
      deliveryDate: createOrderDto.deliveryDate,
      notes: createOrderDto.notes,
      status: OrderStatus.PENDING,
    });

    return order.save();
  }

  async findAll(userId: string, userRole: UserRole) {
    const query: any = {};
    
    if (userRole === UserRole.MANAGER) {
      query.manager = userId;
    } else if (userRole === UserRole.FOURNISSEUR) {
      query.supplier = userId;
    }

    return this.orderModel
      .find(query)
      .populate('manager', 'name email')
      .populate('supplier', 'name email company')
      .populate('stockItem')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const order = await this.orderModel
      .findById(id)
      .populate('manager', 'name email')
      .populate('supplier', 'name email company')
      .populate('stockItem')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Access _id from populated documents
    const managerId = (order.manager as any)._id.toString();
    const supplierId = (order.supplier as any)._id.toString();

    if (userRole === UserRole.MANAGER && managerId !== userId.toString()) {
      throw new ForbiddenException('You can only view your own orders');
    }
    if (userRole === UserRole.FOURNISSEUR && supplierId !== userId.toString()) {
      throw new ForbiddenException('You can only view orders assigned to you');
    }

    return order;
  }

  async updateStatus(id: string, updateOrderDto: UpdateOrderDto, userId: string, userRole: UserRole) {
    const order = await this.orderModel.findById(id).populate('stockItem');

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userRole !== UserRole.FOURNISSEUR) {
      throw new ForbiddenException('Only suppliers can update order status');
    }

    // Compare ObjectIds (order.supplier is an ObjectId, not populated here)
    if (order.supplier.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only update your own orders');
    }

    const oldStatus = order.status;
    const newStatus = updateOrderDto.status;

    console.log(`📝 Updating order ${id}: ${oldStatus} → ${newStatus}`);

    // Handle stock updates based on status changes
    if (newStatus && newStatus !== oldStatus) {
      const stockItem = await this.stockModel.findById(order.stockItem);
      
      if (!stockItem) {
        throw new NotFoundException('Stock item not found');
      }

      // When supplier confirms order → Reduce supplier's stock
      if (newStatus === OrderStatus.CONFIRMED && oldStatus === OrderStatus.PENDING) {
        if (stockItem.quantity < order.quantity) {
          throw new ForbiddenException(`Insufficient stock. Available: ${stockItem.quantity}, Requested: ${order.quantity}`);
        }
        stockItem.quantity -= order.quantity;
        await stockItem.save();
      }

      // When supplier marks as delivered → Add to manager's stock (create new stock entry for manager)
      if (newStatus === OrderStatus.DELIVERED && oldStatus === OrderStatus.CONFIRMED) {
        console.log(`🚚 Marking order as delivered - will add stock to manager ${order.manager}`);
        
        // Check if manager already has this stock item
        const managerStock = await this.stockModel.findOne({
          owner: order.manager,
          name: stockItem.name,
          unit: stockItem.unit,
        });

        console.log(`🔍 Checking if manager has existing stock:`, managerStock ? 'YES' : 'NO');

        if (managerStock) {
          // Add to existing stock
          managerStock.quantity += order.quantity;
          await managerStock.save();
          console.log(`✅ Added ${order.quantity} ${stockItem.unit} to manager's existing stock`);
        } else {
          // Create new stock entry for manager
          const newManagerStock = new this.stockModel({
            name: stockItem.name,
            quantity: order.quantity,
            unit: stockItem.unit,
            category: stockItem.category,
            price: stockItem.price,
            owner: order.manager,
            minQuantity: 0,
            note: `Received from order #${order._id}`,
            sourceStockId: stockItem._id, // Store original supplier's stock ID for reordering
            sourceSupplier: order.supplier, // Store supplier ID for reordering
          });
          const savedStock = await newManagerStock.save();
          console.log(`✅ Created new stock for manager:`, {
            id: savedStock._id,
            name: savedStock.name,
            quantity: savedStock.quantity,
            owner: savedStock.owner,
            sourceStockId: savedStock.sourceStockId,
          });
        }
      }

      // If order is cancelled after confirmation → Restore supplier's stock
      if (newStatus === OrderStatus.CANCELLED && oldStatus === OrderStatus.CONFIRMED) {
        stockItem.quantity += order.quantity;
        await stockItem.save();
      }

      order.status = newStatus;
    }

    await order.save();
    
    // Return populated order
    return this.orderModel
      .findById(id)
      .populate('manager', 'name email')
      .populate('supplier', 'name email company')
      .populate('stockItem')
      .exec();
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userRole !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can delete orders');
    }

    // Compare ObjectIds
    if (order.manager.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only delete your own orders');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ForbiddenException('You can only delete pending orders');
    }

    await this.orderModel.findByIdAndDelete(id);
    return { message: 'Order deleted successfully' };
  }
}
