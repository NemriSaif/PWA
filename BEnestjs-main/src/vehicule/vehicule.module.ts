import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehiculeService } from './vehicule.service';
import { VehiculeController } from './vehicule.controller';
import { Vehicule, VehiculeSchema } from './schemas/vehicule.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Vehicule.name, schema: VehiculeSchema }])],
  controllers: [VehiculeController],
  providers: [VehiculeService],
  exports: [VehiculeService],
})
export class VehiculeModule {}
