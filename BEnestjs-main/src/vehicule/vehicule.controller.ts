import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { VehiculeService } from './vehicule.service';
import { CreateVehiculeDto } from './dto/create-vehicule.dto';
import { UpdateVehiculeDto } from './dto/update-vehicule.dto';

@Controller('vehicule')
export class VehiculeController {
  constructor(private readonly vehiculeService: VehiculeService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }),
  )
  async create(@Body() createVehiculeDto: CreateVehiculeDto) {
    const vehicule = await this.vehiculeService.create(createVehiculeDto);
    console.log('✅ Vehicle added successfully:', vehicule);
    return vehicule;
  }

  @Get()
  findAll() {
    return this.vehiculeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiculeService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      skipMissingProperties: true,
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateVehiculeDto: UpdateVehiculeDto,
  ) {
    const updatedVehicule = await this.vehiculeService.update(
      id,
      updateVehiculeDto,
    );
    console.log('✏️ Vehicle updated successfully:', updatedVehicule);
    return updatedVehicule;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const removedVehicule = await this.vehiculeService.remove(id);
    console.log('🗑️ Vehicle removed successfully:', removedVehicule);
    return removedVehicule;
  }
}
