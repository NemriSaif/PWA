import { Test, TestingModule } from '@nestjs/testing';
import { DailyAssignmentService } from './daily-assignment.service';

describe('DailyAssignmentService', () => {
  let service: DailyAssignmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyAssignmentService],
    }).compile();

    service = module.get<DailyAssignmentService>(DailyAssignmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
