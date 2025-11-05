import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PersonnelService } from './personnel.service';
import { CreatePersonnelDto } from './dto/create-personnel.dto';
import { UpdatePersonnelDto } from './dto/update-personnel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';

@Controller('personnel')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  create(@Body() createPersonnelDto: CreatePersonnelDto) {
    return this.personnelService.create(createPersonnelDto);
  }

  @Get()
  findAll() {
    return this.personnelService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PERSONNEL)
  getMyProfile(@Req() req: any) {
    return this.personnelService.findByUserId(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personnelService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updatePersonnelDto: UpdatePersonnelDto) {
    return this.personnelService.update(id, updatePersonnelDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.personnelService.remove(id);
  }
}
