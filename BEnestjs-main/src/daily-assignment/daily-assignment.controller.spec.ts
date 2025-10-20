import { Test, TestingModule } from '@nestjs/testing';
import { DailyAssignmentController } from './daily-assignment.controller';
import { DailyAssignmentService } from './daily-assignment.service';

describe('DailyAssignmentController', () => {
  let controller: DailyAssignmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyAssignmentController],
      providers: [DailyAssignmentService],
    }).compile();

    controller = module.get<DailyAssignmentController>(DailyAssignmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
