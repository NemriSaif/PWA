import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonnelService } from './personnel.service';
import { PersonnelController } from './personnel.controller';
import { Personnel, PersonnelSchema } from './schemas/personnel.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Personnel.name, schema: PersonnelSchema }])],
  controllers: [PersonnelController],
  providers: [PersonnelService],
  exports: [PersonnelService],
})
export class PersonnelModule {}
