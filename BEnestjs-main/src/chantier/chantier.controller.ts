import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChantierService } from './chantier.service';
import { CreateChantierDto } from './dto/create-chantier.dto';
import { UpdateChantierDto } from './dto/update-chantier.dto';

@Controller('chantier')
export class ChantierController {
  constructor(private readonly chantierService: ChantierService) {}

  @Post()
  create(@Body() createChantierDto: CreateChantierDto) {
    console.log('Received new worksite:', createChantierDto);
    return this.chantierService.create(createChantierDto);
  }

  @Get()
  findAll() {
    return this.chantierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chantierService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChantierDto: UpdateChantierDto) {
    return this.chantierService.update(id, updateChantierDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chantierService.remove(id);
  }

 // Assign personnel for a specific date
@Post(':id/assign-personnel')
assignPersonnel(
  @Param('id') id: string,
  @Body('personnel') personnelId: string,
  @Body('date') date: string, // ISO string
) {
  return this.chantierService.assignPersonnel(id, personnelId, new Date(date));
}

// Remove personnel for a specific date
@Post(':id/remove-personnel')
removePersonnel(
  @Param('id') id: string,
  @Body('personnel') personnelId: string,
  @Body('date') date: string, // ISO string
) {
  return this.chantierService.removePersonnel(id, personnelId, new Date(date));
}

  // Assign vehicle for a specific date
@Post(':id/assign-vehicule')
assignVehicule(
  @Param('id') id: string,
  @Body('vehicule') vehiculeId: string,
  @Body('date') date: string, // ISO string
) {
  return this.chantierService.assignVehicule(id, vehiculeId, new Date(date));
}

// Remove vehicle for a specific date
@Post(':id/remove-vehicule')
removeVehicule(
  @Param('id') id: string,
  @Body('vehicule') vehiculeId: string,
  @Body('date') date: string, // ISO string
) {
  return this.chantierService.removeVehicule(id, vehiculeId, new Date(date));
}
}
