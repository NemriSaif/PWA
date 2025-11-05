import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { DailyAssignmentService } from './daily-assignment.service';
import { CreateDailyAssignmentDto } from './dto/create-daily-assignment.dto';
import { UpdateDailyAssignmentDto } from './dto/update-daily-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@Controller('daily-assignment')
export class DailyAssignmentController {
  constructor(private readonly dailyAssignmentService: DailyAssignmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
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

  @Get('my-assignments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PERSONNEL)
  getMyAssignments(@Req() req: any) {
    return this.dailyAssignmentService.findByPersonnelUserId(req.user._id);
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