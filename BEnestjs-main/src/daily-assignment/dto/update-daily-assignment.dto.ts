import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyAssignmentDto } from './create-daily-assignment.dto';

export class UpdateDailyAssignmentDto extends PartialType(CreateDailyAssignmentDto) {}
