import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DailyAssignmentService } from './daily-assignment.service';
import { CreateDailyAssignmentDto } from './dto/create-daily-assignment.dto';
import { UpdateDailyAssignmentDto } from './dto/update-daily-assignment.dto';

@Controller('daily-assignment')
export class DailyAssignmentController {
  constructor(private readonly dailyAssignmentService: DailyAssignmentService) {}

  @Post()
  create(@Body() createDto: CreateDailyAssignmentDto) {
    return this.dailyAssignmentService.create(createDto);
  }

  @Get()
  findAll(@Query('date') date?: string, @Query('chantier') chantier?: string) {
    if (date) {
      return this.dailyAssignmentService.findByDate(date);
    }
    if (chantier) {
      return this.dailyAssignmentService.findByChantier(chantier);
    }
    return this.dailyAssignmentService.findAll();
  }

  @Get('date-range')
  findByDateRange(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.dailyAssignmentService.findByDateRange(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dailyAssignmentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDailyAssignmentDto) {
    return this.dailyAssignmentService.update(id, updateDto);
  }

  @Patch(':id/personnel/:personnelId/pay')
  markPersonnelAsPaid(
    @Param('id') id: string,
    @Param('personnelId') personnelId: string
  ) {
    return this.dailyAssignmentService.markPersonnelAsPaid(id, personnelId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dailyAssignmentService.remove(id);
  }
}