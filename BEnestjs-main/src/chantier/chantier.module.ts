// chantier.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChantierService } from './chantier.service';
import { ChantierController } from './chantier.controller';
import { Chantier, ChantierSchema } from './schemas/chantier.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Chantier.name, schema: ChantierSchema }])],
  controllers: [ChantierController],
  providers: [ChantierService],
})
export class ChantierModule {}
