import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DailyAssignmentService } from './daily-assignment.service';
import { DailyAssignmentController } from './daily-assignment.controller';
import { DailyAssignment, DailyAssignmentSchema } from './schemas/daily-assignment.schema';
import { Personnel, PersonnelSchema } from '../personnel/schemas/personnel.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyAssignment.name, schema: DailyAssignmentSchema },
      { name: Personnel.name, schema: PersonnelSchema },
    ]),
  ],
  controllers: [DailyAssignmentController],
  providers: [DailyAssignmentService],
  exports: [DailyAssignmentService],
})
export class DailyAssignmentModule {}