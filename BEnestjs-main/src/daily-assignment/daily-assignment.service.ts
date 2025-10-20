import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDailyAssignmentDto } from './dto/create-daily-assignment.dto';
import { UpdateDailyAssignmentDto } from './dto/update-daily-assignment.dto';
import { DailyAssignment } from './schemas/daily-assignment.schema';

@Injectable()
export class DailyAssignmentService {
  constructor(
    @InjectModel(DailyAssignment.name) private dailyAssignmentModel: Model<DailyAssignment>,
  ) {}

  async create(createDto: CreateDailyAssignmentDto): Promise<DailyAssignment> {
    // Check if assignment already exists for this date and chantier
    const existingAssignment = await this.dailyAssignmentModel.findOne({
      date: new Date(createDto.date),
      chantier: createDto.chantier,
    });

    if (existingAssignment) {
      throw new BadRequestException('Assignment already exists for this date and work site');
    }

    // Calculate costs
    const totalPersonnelCost = createDto.personnelAssignments?.reduce(
      (sum, p) => sum + (p.salary || 0), 
      0
    ) || 0;

    const totalFuelCost = createDto.fuelCosts?.reduce(
      (sum, f) => sum + f.amount, 
      0
    ) || 0;

    const totalCost = totalPersonnelCost + totalFuelCost;

    const assignment = new this.dailyAssignmentModel({
      ...createDto,
      date: new Date(createDto.date),
      totalPersonnelCost,
      totalFuelCost,
      totalCost,
    });

    return assignment.save();
  }

  async findAll(): Promise<DailyAssignment[]> {
    return this.dailyAssignmentModel
      .find()
      .populate('chantier')
      .populate('personnelAssignments.personnel')
      .populate('vehiculeAssignments.vehicule')
      .populate('fuelCosts.vehicule')
      .sort({ date: -1 })
      .exec();
  }

  async findOne(id: string): Promise<DailyAssignment> {
    const assignment = await this.dailyAssignmentModel
      .findById(id)
      .populate('chantier')
      .populate('personnelAssignments.personnel')
      .populate('vehiculeAssignments.vehicule')
      .populate('fuelCosts.vehicule')
      .exec();

    if (!assignment) throw new NotFoundException('Daily assignment not found');
    return assignment;
  }

  async findByDate(date: string): Promise<DailyAssignment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.dailyAssignmentModel
      .find({
        date: { $gte: startOfDay, $lte: endOfDay }
      })
      .populate('chantier')
      .populate('personnelAssignments.personnel')
      .populate('vehiculeAssignments.vehicule')
      .populate('fuelCosts.vehicule')
      .exec();
  }

  async findByChantier(chantierId: string): Promise<DailyAssignment[]> {
    return this.dailyAssignmentModel
      .find({ chantier: chantierId })
      .populate('chantier')
      .populate('personnelAssignments.personnel')
      .populate('vehiculeAssignments.vehicule')
      .populate('fuelCosts.vehicule')
      .sort({ date: -1 })
      .exec();
  }

  async findByDateRange(startDate: string, endDate: string): Promise<DailyAssignment[]> {
    return this.dailyAssignmentModel
      .find({
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
      .populate('chantier')
      .populate('personnelAssignments.personnel')
      .populate('vehiculeAssignments.vehicule')
      .populate('fuelCosts.vehicule')
      .sort({ date: -1 })
      .exec();
  }

  async update(id: string, updateDto: UpdateDailyAssignmentDto): Promise<DailyAssignment> {
    // Recalculate costs
    const totalPersonnelCost = updateDto.personnelAssignments?.reduce(
      (sum, p) => sum + (p.salary || 0), 
      0
    ) || 0;

    const totalFuelCost = updateDto.fuelCosts?.reduce(
      (sum, f) => sum + f.amount, 
      0
    ) || 0;

    const totalCost = totalPersonnelCost + totalFuelCost;

    const updated = await this.dailyAssignmentModel
      .findByIdAndUpdate(
        id,
        {
          ...updateDto,
          totalPersonnelCost,
          totalFuelCost,
          totalCost,
        },
        { new: true }
      )
      .populate('chantier')
      .populate('personnelAssignments.personnel')
      .populate('vehiculeAssignments.vehicule')
      .populate('fuelCosts.vehicule')
      .exec();

    if (!updated) throw new NotFoundException('Daily assignment not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.dailyAssignmentModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Daily assignment not found');
  }

  // Mark personnel as paid in assignment
  async markPersonnelAsPaid(assignmentId: string, personnelId: string): Promise<DailyAssignment> {
    const assignment = await this.dailyAssignmentModel.findById(assignmentId);
    if (!assignment) throw new NotFoundException('Assignment not found');

    const personnelAssignment = assignment.personnelAssignments.find(
      p => p.personnel.toString() === personnelId
    );

    if (!personnelAssignment) {
      throw new NotFoundException('Personnel not found in this assignment');
    }

    personnelAssignment.isPayed = true;

    return assignment.save();
  }
}